describe('Authentication', () => {
  it('TC-01: Homepage loads', () => {
    cy.visit('/')
    cy.contains('AI Lecturer').should('be.visible')
  })

  it('TC-02: Register page loads', () => {
    cy.visit('/register')
    cy.contains('Create').should('be.visible')
  })

  it('TC-03: Login page loads', () => {
    cy.visit('/login')
    cy.contains('Sign in').should('be.visible')
  })

  it('TC-04: Guest page loads', () => {
    cy.visit('/guest')
    cy.contains('free lecture').should('be.visible')
  })

  it('TC-05: Register button enabled when all fields filled', () => {
    cy.visit('/register')
    cy.get('button').last().should('be.disabled')
    cy.get('input').first().type('testuser123')
    cy.get('input').eq(1).type('test@test.com')
    cy.get('input').eq(2).type('testpass123')
    cy.get('button').last().should('not.be.disabled')
  })

  it('TC-06: Login with wrong password shows error', () => {
    cy.visit('/login')
    cy.get('input').first().type('wronguser')
    cy.get('input').eq(1).type('wrongpassword')
    cy.get('button').last().click()
    cy.wait(2000)
    cy.get('[class*="red"], [class*="error"], .bg-red-50').should('exist')
  })
})
