// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --

Cypress.Commands.add("login", user => { 
    cy.visit('/')
    cy.contains('Connexion').click()
    cy.get('#userName').type(user.email)
    cy.get('#userPassword').type(user.password)
    cy.get('#submit').click()
    cy.contains(user.name)
    cy.contains('Actualités')
})

Cypress.Commands.add("logout", user => { 
    cy.contains(user.name).click()
    cy.contains('Déconnexion').click()
    cy.contains('Connexion')
})
