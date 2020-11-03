const express = require('express');
const ExpressError = require('../expressError');
const slugify = require('slugify')
const db = require('../db');

let router = new express.Router();

// GET /companies
// Returns list of companies, like {companies: [{code, name}, ...]}
router.get('/', async function(req, res, next){
    try {
        const compResult = await db.query(
            `SELECT code, name FROM companies ORDER BY name`
        )
        

        // const industryResult = await db.query(
        //     `SELECT industry_code FROM companies_industries WHERE company_code = compResult.rows[0].code`
        // )
        
        return res.json({'companies': compResult.rows})
    } catch(err){
        return next(err)
    }
})

// GET /companies/[code]
// Return obj of company: {company: {code, name, description, invoices: [id, ...]}}
// If the company given cannot be found, this should return a 404 status response.
// add in industries for the company
router.get('/:code', async function(req, res, next){
    try {
        let code = req.params.code;

        const compResult = await db.query(
            `SELECT code, name, description FROM companies WHERE code = $1`, [code]
        )

        const invResult = await db.query(
            `SELECT id FROM invoices WHERE comp_code = $1`, [code]
        )

        if (compResult.rows.length === 0){
            throw new ExpressError(`no such company: ${code}`, 404)
        }

        const company = compResult.rows[0];
        const invoices = invResult.rows;

        company.invoices = invoices.map(inv => inv.id);

        return res.json({'company': company})
    } catch(err){
        return next(err)
    }
})

// POST /companies
// Adds a company.
// Needs to be given JSON like: {code, name, description}
// Returns obj of new company: {company: {code, name, description}}
router.post('/', async function(req, res, next){
    try {
        let {name, description} = req.body;
        let code = slugify(name, {lower: true})

        const result = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description`, [code, name, description]
        )
        return res.status(201).json({'company': result.rows[0]})
    } catch(err){
        return next(err)
    }
})

// PUT /companies/[code]
// Edit existing company.
// Should return 404 if company cannot be found.
// Needs to be given JSON like: {name, description}
// Returns update company object: {company: {code, name, description}}
router.put('/:code', async function(req, res, next){
    try {
        let {name, description} = req.body;
        let code = req.params.code;

        const result = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code = $3 RETURNING code, name, description`, [name, description, code]
        )
        if (result.rows.length === 0){
            throw new ExpressError(`no such company: ${code}`, 404)
        } else {
            return res.json({'company': result.rows[0]})
        }
    } catch(err){
        return next(err)
    }
})

// DELETE /companies/[code]
// Deletes company.
// Should return 404 if company cannot be found.
// Returns {status: "deleted"}
router.delete('/:code', async function(req, res, next){
    try {
        let code = req.params.code;

        const result = await db.query(
            `DELETE FROM companies WHERE code=$1 RETURNING code`, [code]
        )

        if (result.rows.length === 0){
            throw new ExpressError(`no such company: ${code}`, 404)
        } else {
            return res.json({'status': 'deleted'})
        }
    } catch(err){
        return next(err)
    }
})

module.exports = router
