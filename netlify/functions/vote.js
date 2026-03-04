const fs = require("fs");
const path = require("path");
const os = require("os");

const dataPath = path.join(os.tmpdir(), "votes.json");

exports.handler = async (event) => {

  // ===== POST =====
  if (event.httpMethod === "POST") {
    const vote = JSON.parse(event.body);

    let votes = [];

    if (fs.existsSync(dataPath)) {
      votes = JSON.parse(fs.readFileSync(dataPath));
    }

    votes.push(vote);

    fs.writeFileSync(dataPath, JSON.stringify(votes));

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Voto salvo!" }),
    };
  }

  // ===== GET =====
  if (event.httpMethod === "GET") {
    if (!fs.existsSync(dataPath)) {
      return {
        statusCode: 200,
        body: JSON.stringify([]),
      };
    }

    const votes = JSON.parse(fs.readFileSync(dataPath));

    return {
      statusCode: 200,
      body: JSON.stringify(votes),
    };
  }

  // ===== DELETE =====
  if (event.httpMethod === "DELETE") {
    if (fs.existsSync(dataPath)) {
      fs.unlinkSync(dataPath);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Votos apagados!" }),
    };
  }

  // ===== METHOD NOT ALLOWED =====
  return { statusCode: 405 };
};