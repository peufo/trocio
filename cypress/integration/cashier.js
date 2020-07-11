
import trocA from '../fixtures/trocA.json'
import users from '../fixtures/users.json'

describe('Cashier', () => {
    context('deskop resolution', () => {
        beforeEach(() => cy.viewport(1280, 720))
        let cashierContainer = ''

        it('Get cashier', () => {
            cy.login(users[0])
            cy.visit(`/cashier?troc=${trocA._id}`)
        })

        it('Select client A', () => {
            cy.wait(100)
            cy.get('#searchUser1').type(users[0].name)
            cy.get('#proposition li').contains(users[0].name).click()
            
        })

        it('Save cashier container', () => {
            cashierContainer = Cypress.$('#cashierContainer').text()
        })

        it('Select client B', () => {
            cy.wait(100)
            cy.get('#searchUser1').type(users[1].name.substr(0, 2))
            cy.wait(100)
            cy.contains(users[1].name).click()
        })

        it('Select client A', () => {
            cy.wait(100)
            cy.get('#searchUser1').type(users[0].name)
            cy.wait(100)
            cy.get('#proposition li').contains(users[0].name).click()
            
        })

        it('Compare cashier container', () => {
            expect(Cypress.$('#cashierContainer').text()).to.equal(cashierContainer)
        })
    
    })

    /*
    context('mobile resolution', () => {
        beforeEach(() => cy.viewport('samsung-s10'))
        
        it('Get cashier', () => {
            cy.login(users[0])
            cy.visit(`/cashier?troc=${trocA._id}`)
        })

        it('Find client', () => {
            cy.wait(100)
            cy.get('#searchUser1').type(users[1].name.substr(0, 2))
            cy.contains(users[1].name).click()
        })  

    })
    */
})