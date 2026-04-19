describe('Navigation', () => {
  it('TC-07: Homepage has Try as guest link', () => {
    cy.visit('/')
    cy.contains(/guest/i).should('be.visible')
  })

  it('TC-08: Homepage has Get started button', () => {
    cy.visit('/')
    cy.contains(/get started/i).should('be.visible')
  })

  it('TC-09: Guest page has topic input', () => {
    cy.visit('/guest')
    cy.get('input').first().should('be.visible')
  })

  it('TC-10: Guest generate button disabled without input', () => {
    cy.visit('/guest')
    cy.get('button').contains(/generate/i).should('be.disabled')
  })

  it('TC-11: Mobile viewport renders correctly', () => {
    cy.viewport(390, 844)
    cy.visit('/')
    cy.contains('AI Lecturer').should('be.visible')
  })

  it('TC-12: Register link on login page works', () => {
    cy.visit('/login')
    cy.contains(/register|sign up|create/i).click()
    cy.url().should('include', '/register')
  })
})
