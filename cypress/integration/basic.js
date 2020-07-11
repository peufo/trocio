import users from '../fixtures/users.json'

describe('Navigation', () => {

	it('Login', () => {
		cy.login(users[0])
	})

	it('Logout', () => {
		cy.logout(users[0])
	})


	/*
	

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