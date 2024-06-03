# OpenAI PDF Summary Tool

This JS script is to generate pdf summaries.

### Prerequisities

NodeJS(>20)

OpenAI key

### How to use

Provide input directory and filenames and output directory along with openai key in b.json(example b.json file is included)

Provide queries in a.json

```
npm install
npm start
```

Then output docx files for summaries with same name per pdf file will be generated in output folder defined in b.json.

(If error is occured during run, error.txt will be generated)
