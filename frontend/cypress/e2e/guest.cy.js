describe('Guest Mode', () => {
  it('TC-13: Guest banner shows on guest page', () => {
    cy.visit('/guest')
    cy.contains("guest mode").should('be.visible')
  })

  it('TC-14: Guest page shows Create account button', () => {
    cy.visit('/guest')
    cy.contains(/create account/i).should('be.visible')
  })

  it('TC-15: Guest page topic and subject inputs exist', () => {
    cy.visit('/guest')
    cy.get('input').should('have.length.at.least', 2)
  })

  it('TC-16: Guest difficulty buttons exist', () => {
    cy.visit('/guest')
    cy.contains('Beginner').should('be.visible')
    cy.contains('Intermediate').should('be.visible')
    cy.contains('Advanced').should('be.visible')
  })

  it('TC-17: Clicking difficulty button changes selection', () => {
    cy.visit('/guest')
    cy.contains('Advanced').click()
    cy.contains('Advanced').should('have.class', 'bg-emerald-700')
  })

  it('TC-18: Lecturer preview shows when subject typed', () => {
    cy.visit('/guest')
    cy.get('input').eq(1).type('Physics')
    cy.contains('Your assigned lecturer').should('be.visible')
  })
})
