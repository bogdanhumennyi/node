const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const MongoLib = require('mongodb').MongoClient;
const MongoClient = new MongoLib("mongodb://localhost:27017/", { useNewUrlParser: true });

function Create_HTML(elements) {
    fs.writeFile('index.html', '', function (error) {
        if(error) {
            console.log('Error: %s', error);
        }
    });
    for(let i = 0; i < elements.length; i++) {
        fs.appendFile(
            'index.html',
            `{'title': ${elements[i]['title']}, 'href': ${elements[i]['href']} }\n`,
            function (error) {
                if(error) {
                    console.log('Error: %s', error);
                }
            }
        );
    }
}

function Insert_Mongo(elements) {
    console.log(MongoClient.connect(function (error, client) {
        const db = client.db('parser');
        const collection = db.collection('habra');
        console.log(collection.insertMany(elements, function (error_insert, result_insert) {
            if(error_insert) {
                console.log(error_insert);
            } else {
                console.log(result_insert.ops);
            }
            console.log(client.close());
        }));
    }));
}

request('https://m.habr.com/ru/top/daily/', function (error, response, body) {
    if(error) {
        console.log(error);
    } else {
        let $ = cheerio.load(body);
        let elements = [];
        for (let i = 0; i < $('div.tm-news-block > div > a > h3').length; i++) {
            if($(`div.tm-news-block > div > a:nth-child(${i}) > h3`).text().length != 0)
                elements.push({
                    'title': $(`div.tm-news-block > div > a:nth-child(${i}) > h3`).text(),
                    'href': 'https://m.habr.com' + $(`div.tm-news-block > div > a:nth-child(${i})`).attr('href')
                })
        }
        Create_HTML(elements);
        Insert_Mongo(elements);
        console.log(elements);
    }
});