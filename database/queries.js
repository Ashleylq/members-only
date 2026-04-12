const Pool = require("./pool");

async function createUser(firstname, lastname, username, password){
    await Pool.query(`INSERT INTO users(first_name, last_name, username, password, isMember, isAdmin)
                      VALUES($1, $2, $3, $4, $5, $6)`, [firstname, lastname, username, password, false, false]);
}

async function findByUsername(username){
    const { rows } = await Pool.query("SELECT * FROM users WHERE username = $1", [username]);
    return rows[0];
}

async function findById(id){
    const { rows } = await Pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return rows[0];
}

module.exports = {
    createUser,
    findByUsername,
    findById
}