"use strict";

describe("multiple instances: init plugin (with nationalMode=false) to test multiple instances", function() {

  var input2,
    afghanistanCountryCode = "af",
    albaniaCountryCode = "al",
    chinaCountryCode = "cn",
    chinaDialCode = "+86";

  beforeEach(function() {
    intlSetup();
    input = $("<input>");
    input2 = $("<input>");
    // japan and china
    input.intlTelInput({
      onlyCountries: [chinaCountryCode, afghanistanCountryCode],
      nationalMode: false
    });
    // korea, china and russia
    input2.intlTelInput({
      onlyCountries: ['kr', chinaCountryCode, 'ru', albaniaCountryCode],
      nationalMode: false
    });
    $("body").append(getParentElement(input)).append(getParentElement(input2));
  });

  afterEach(function() {
    getParentElement(input).remove();
    getParentElement(input2).remove();
    input.intlTelInput("destroy");
    input2.intlTelInput("destroy");
    input = input2 = null;
  });

  it("instances have different country lists", function() {
    expect(getListLength()).toEqual(2);
    expect(getListLength(input2)).toEqual(4);
  });

  it("instances have different default countries selected", function() {
    expect(getSelectedFlagElement()).toHaveClass(afghanistanCountryCode);
    expect(getSelectedFlagElement(input2)).toHaveClass(albaniaCountryCode);
  });

  it("selecting an item from the first input dropdown only updates the flag on that input", function() {
    selectFlag(chinaCountryCode);
    expect(getInputVal()).toEqual(chinaDialCode);
    expect(getInputVal(input2)).toEqual("");
  });

  it("updating the number on the first input only updates the flag on that input", function() {
    input.val(chinaDialCode + " 123456");
    triggerKeyOnInput(" ");
    expect(getSelectedFlagElement()).toHaveClass(chinaCountryCode);
    expect(getSelectedFlagElement(input2)).toHaveClass(albaniaCountryCode);
  });



  describe("clicking open dropdown on the first input", function() {

    beforeEach(function() {
      getSelectedFlagContainer().click();
    });

    it("only opens the dropdown on that input", function() {
      expect(getListElement()).toBeVisible();
      expect(getListElement(input2)).not.toBeVisible();
    });

    it("then clicking open dropdown on the second will close the first and open the second", function() {
      getSelectedFlagContainer(input2).click();
      expect(getListElement()).not.toBeVisible();
      expect(getListElement(input2)).toBeVisible();
    });

  });

});
