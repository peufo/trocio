import userA from '../fixtures/userA.json'

describe('Navigation', () => {

	it('Visit home page', () => {
		cy.visit('localhost:3000/')
	})

	it('Login', () => {
		cy.contains('Connexion').click()
		cy.get('#userName').type(userA.email)
		cy.get('#userPassword').type(userA.password)
		cy.get('#submit').click()
		cy.contains(userA.name)
		cy.contains('Actualités')
	})

	it('Logout', () => {
		cy.contains(userA.name).click()
		cy.contains('Déconnexion').click()
		cy.contains('Connexion')
	})


	/*
	beforeEach(() => {
		cy.visit('/')
	});

	it('has the correct <h1>', () => {
		cy.contains('h1', 'Great success!')
	});

	it('navigates to /about', () => {
		cy.get('nav a').contains('about').click();
		cy.url().should('include', '/about');
	});

	it('navigates to /blog', () => {
		cy.get('nav a').contains('blog').click();
		cy.url().should('include', '/blog');
	});
	*/
});