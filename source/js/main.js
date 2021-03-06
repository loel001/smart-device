"use strict";

(function () {
  // accordion-footer
  const MOBILE_WIDTH = 768;
  const accordionTittle = document.querySelectorAll('.navigation-footer__wrapper h2');
  const modifiedAccordionIittle = Array.prototype.slice.call(accordionTittle);
  const accordionItems = document.querySelectorAll('.navigation-footer__list');
  const modifiedAccordionItems = Array.prototype.slice.call(accordionItems);
  const accordionWrappers = document.querySelectorAll('.navigation-footer__wrapper');
  const modifiedAccordionWrappers = Array.prototype.slice.call(accordionWrappers);

  if (modifiedAccordionIittle.length !== 0) {
    modifiedAccordionIittle.forEach(function (element, index) {
      element.addEventListener("click", function (evt) {
        if (document.documentElement.clientWidth < MOBILE_WIDTH) {
          evt.preventDefault();
          if (modifiedAccordionItems[index].classList.contains('show') === false) {
            modifiedAccordionItems.forEach(function (elem, ind) {
              if (elem.classList.contains('show') === true) {
                elem.classList.remove('show');
              }
              if (modifiedAccordionWrappers[ind].classList.contains('js-accordion') === false) {
                modifiedAccordionWrappers[ind].classList.add('js-accordion');
              }
            });
            modifiedAccordionWrappers[index].classList.remove('js-accordion');
            modifiedAccordionItems[index].classList.add('show');
          } else {
            modifiedAccordionWrappers[index].classList.add('js-accordion');
            modifiedAccordionItems[index].classList.remove('show');
          }
        }
      });
    });
  }

  // Popup-desktop
  const letterButton = document.querySelector('.navigation__button');
  const popup = document.querySelector('.letter');
  const surname = document.getElementById('name');
  const telephoneNumber = document.getElementById('telephone-number');
  const close = document.querySelector('.popup__wrapper button');
  const appeal = document.getElementById('question');
  const form = document.querySelector('.popup__letter form');
  const letterWrapper = document.querySelector('.popup');
  let storage = "";
  const wrapper = document.querySelector('body');

  if (letterButton) {
    letterButton.addEventListener("click", function (evt) {
      evt.preventDefault();
      popup.classList.add('letter--show');
      wrapper.classList.add('hide');

      if (storage) {
        surname.value = storage;
        telephoneNumber.focus();
      } else {
        surname.focus();
      }
    });
  }

  if (close) {
    close.addEventListener("click", function (evt) {
      evt.preventDefault();
      popup.classList.remove('letter--show');
      wrapper.classList.remove('hide');
    });
  }

  if (form) {
    form.addEventListener("submit", function (evt) {
      if (!surname.value || telephoneNumber.value.length != 17  || !appeal.value) {
        evt.preventDefault();
        letterWrapper.classList.add('popup--error');
        setTimeout(function () {
          letterWrapper.classList.remove('popup--error');
        }, 1000);
      } else {
        localStorage.setItem('surname', surname.value);
        localStorage.setItem('telephoneNumber', telephoneNumber.value);
        localStorage.setItem('appeal', appeal.value);
      }
    });
  }

  window.addEventListener("keydown", function (evt) {
    if (evt.keyCode === 27) {
      evt.preventDefault();
      if (popup) {
        if (popup.classList.contains('letter--show')) {
          wrapper.classList.remove('hide');
          popup.classList.remove('letter--show');
        }
      }
    }
  });
})();
