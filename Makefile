DOCKERTAG=v1.0
DBNAME=secureapp.db

db_testdata: init_db
	node db_generatedata.js > db_testdata.sql
	sqlite3 app/${DBNAME} < db_testdata.sql

local_certs:
	mkdir certs || true
	openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/privkey.pem -out certs/fullchain.pem -subj "/C=ZA/ST=Gauteng/L=Boksburg/O=apollolms/OU=IT/CN=apollolms.co.za"
	cp certs/fullchain.pem certs/chain.pem

init_db:
	sqlite3 ${DBNAME} "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, name TEXT, passwordhash TEXT, lastlogon INT);"
	sqlite3 ${DBNAME} "CREATE TABLE IF NOT EXISTS queries (id INTEGER PRIMARY KEY, userid INT, query TEXT, querytime INT);"
	sqlite3 ${DBNAME} "DELETE FROM users;"
	sqlite3 ${DBNAME} "DELETE FROM queries;"
	mv ${DBNAME} app/

clean:
	rm -rf app/node_modules

test:
	$(MAKE) local-build
	$(MAKE) DBNAME=testdb.sql init_db
	$(MAKE) DBNAME=testdb.sql db_testdata
	cd app && NO_SERVER=true DB_FILENAME=testdb.sql npm run test
	rm app/testdb.sql

build: clean init_db
	$(MAKE) test
	docker build -f Dockerfile.nodeapp -t mysecureapp:node.${DOCKERTAG} .
	docker build -f Dockerfile.nginx -t mysecureapp:nginx.${DOCKERTAG} .

start_apps: build
	docker run -d -p 8443:443 --name mysecureapp-nginx mysecureapp:nginx.${DOCKERTAG} || true
	docker run -d -p 172.17.0.1:8080:8080 --name mysecureapp-node mysecureapp:node.${DOCKERTAG} || true

stop_apps:
	docker stop mysecureapp-nginx || true
	docker stop mysecureapp-node || true
	docker rm mysecureapp-nginx || true
	docker rm mysecureapp-node || true

local-build: clean
	cd app && npm install
