const express = require('express');
const ExpressError = require('../expressError');
const db = require('../db');

let router = new express.Router();

// listing all industries, which should show the company code(s) for that industry
router.get('/', async function(req, res, next){
    try {
        // const results = await db.query(`
        //     SELECT c.code  
        //     FROM companies AS c
        //     LEFT JOIN companies_industries AS ci 
        //     ON c.code = ci.company_code
        //     LEFT JOIN industries AS i
        //     ON  ci.industry_code = i.code
        //     WHERE c.code = $1;
        // `, [req.params.code])
        const results = await db.query(`
            SELECT i.code  
            FROM industries AS i
            LEFT JOIN companies_industries AS ci 
            ON i.code = ci.industry_code
            LEFT JOIN companies AS c
            ON  ci.company_code = c.code
            WHERE i.code = $1;
        `, [req.params.code])

        if (results.rows.length === 0) {
            throw new ExpressError(`industry not found with code ${req.params.code}`, 404)
        }
        
        return res.json({'industries': results.rows})
    } catch(err){
        return next(err)
    }
})

// adding an industry
router.post('/', async function(req, res, next){
    try {
        let {code, industry} = req.body;

        const result = await db.query(
            `INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry`, [code, industry]
        )
        return res.status(201).json({'industry': result.rows[0]})
    } catch(err){
        return next(err)
    }
})

// associating an industry to a company

module.exports = router
