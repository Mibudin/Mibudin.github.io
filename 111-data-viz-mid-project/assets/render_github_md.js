"use strict";

(() => {

const fs = require("fs");
const http = require("https");

const url = "https://api.github.com/markdown";
const options = {
    method: "POST",
    headers: {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "Content-Type": "application/json",
        "User-Agent": "node.js"
    }
};
const data = fs.readFileSync("./assets/report.md", "utf8");
const body = JSON.stringify({text: data});

let result = "";
const req = http.request(url, options, (res) => {
    console.log(res.statusCode);

    res.setEncoding("utf8");
    res.on("data", (chunk) => {
        result += chunk;
    });

    res.on("end", () => {
        result = result.replace(/href="#/gm, "href=\"#user-content-");
        result = result.replace(/<section data-footnotes="">/gm, "<section class=\"footnotes\" data-footnotes=\"\">")
        // console.log(result);
        fs.writeFileSync("./assets/report.html", result);
    });
});

req.on("error", (e) => {
    console.error(e);
});

req.write(body);
req.end();

})();
