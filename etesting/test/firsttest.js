describe('new user signs up and browses lens', function() {
  it('user finds signup form from Lens home page', function(browser) {
    browser
      .navigateTo('http://127.0.0.1:3000/')
      .waitForElementVisible('#Sign_Up_Button')
      .click('#Sign_Up_Button')
      .waitForElementVisible('#Sign_Up_Form')
      .assert.visible('#Sign_Up_Form');
  });
});
