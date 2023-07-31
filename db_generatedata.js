for (let i = 1; i < 50; i++) {
    let name = Buffer.from(Math.random().toString()).toString('hex');
    let hash = Buffer.from(Math.random().toString()).toString('hex');
    console.log(`INSERT INTO users VALUES (NULL, '${name}','${hash}',${i});`);
    let qstring = `INSERT INTO queries VALUES (NULL, ${i}, '{}', '0')`;
    for (let j = 1; j < 50; j++) {
        qstring += `, `;
        let query = JSON.stringify({
            'one': Buffer.from(Math.random().toString()).toString('hex')
        });
        qstring += `(NULL, ${i},'${query}', ${j})`;
        
    }
    qstring += ';';
    console.log(qstring);
}