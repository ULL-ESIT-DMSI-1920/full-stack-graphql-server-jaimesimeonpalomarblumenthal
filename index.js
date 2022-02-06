const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const graphql = require("graphql");
const ExpressGraphQL = require("express-graphql");

const app = express();
const database = new sqlite3.Database("./my.db");

const createContactTable = () => {
    const query = `
        CREATE TABLE IF NOT EXISTS contacts (
        id integer PRIMARY KEY,
        firstName text,
        lastName text,
        email text UNIQUE)`;
    return database.run(query);
}

createContactTable();

const ContactType = new graphql.GraphQLObjectType({
    name: "Contact",
    fields: {
        id: { type: graphql.GraphQLID },
        firstName: { type: graphql.GraphQLString },
        lastName: { type: graphql.GraphQLString },
        email: { type: graphql.GraphQLString }   
    }
});


var queryType = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
        contacts: {
            type: graphql.GraphQLList(ContactType),
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {

                    database.all("SELECT * FROM contacts;", function (err, rows) {
                        if (err) {
                            reject([]);
                        }
                        resolve(rows);
                    });
                });

            }
        },
        contact: {
            type: ContactType,
            args: {
                id: {
                    type: new graphql.GraphQLNonNull(graphql.GraphQLID)
                }
            },
            resolve: (root, {
                id
            }, context, info) => {
                return new Promise((resolve, reject) => {

                    database.all("SELECT * FROM contacts WHERE id = (?);", [id], function (err, rows) {
                        if (err) {
                            reject(null);
                        }
                        resolve(rows[0]);
                    });
                });
            }
        }
    }
});