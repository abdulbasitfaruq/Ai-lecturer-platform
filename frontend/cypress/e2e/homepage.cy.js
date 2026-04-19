describe('Homepage', () => {
  it('TC-19: Homepage loads all sections', () => {
    cy.visit('/')
    cy.contains('AI Lecturer').should('be.visible')
  })

  it('TC-20: Navbar has correct links', () => {
    cy.visit('/')
    cy.contains('Home').should('be.visible')
    cy.contains(/guest/i).should('be.visible')
    cy.contains(/get started/i).should('be.visible')
    cy.contains(/sign in/i).should('be.visible')
  })

  it('TC-21: Get started navigates to register', () => {
    cy.visit('/')
    cy.contains(/get started/i).first().click()
    cy.url().should('include', '/register')
  })

  it('TC-22: Try as guest navigates to guest page', () => {
    cy.visit('/')
    cy.contains(/try as guest/i).click()
    cy.url().should('include', '/guest')
  })

  it('TC-23: Footer is visible', () => {
    cy.visit('/')
    cy.scrollTo('bottom')
    cy.contains('AbdulBasit Farooq').should('be.visible')
  })

  it('TC-24: Page title is correct', () => {
    cy.visit('/')
    cy.title().should('eq', 'AI Lecturer Platform')
  })
})
