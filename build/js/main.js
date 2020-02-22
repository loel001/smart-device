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

  // scroll
  $('body').animatescroll();

  // iMask

  $(document).ready(function () {
    $("#telephone").inputmask("+7 (999)-999-9999", {showMaskOnFocus: true});
    $("#telephone-number").inputmask("+7 (999)-999-9999", {showMaskOnFocus: true});
  });

  // Popup-desktop


  const letterButton = document.querySelector('.navigation__button');
  const popup = document.querySelector('.popup');
  const surname = document.getElementById('name');
  const telephoneNumber = document.getElementById('.telephone-number');
  const close = document.querySelector('.popup__wrapper button');
  const appeal = document.getElementById('.question');
  const form = document.querySelector('.popup__letter form');
  let isStorageSupport = true;
  let storage = "";
  const body = document.querySelector('body');

  try {
    storage = localStorage.getItem("surname");
  } catch (err) {
    isStorageSupport = false;
  }

  if (letterButton) {
    letterButton.addEventListener("click", function (evt) {
      evt.preventDefault();
      popup.classList.add('popup--show');
      body.classList.add('popup-lettter');

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
      popup.classList.remove('popup--show');
      body.classList.remove('popup-lettter');
      if (popup.classList.contains('popup--error') === true) {
        popup.classList.remove('popup--error');
      }

    });
  }

  if (form) {
    form.addEventListener("submit", function (evt) {
      if (!surname.value || !telephoneNumber.value || !appeal.value) {
        evt.preventDefault();
        popup.classList.add('popup--error');
        console.log(1);
      } else {
        if (isStorageSupport) {
          localStorage.setItem('surname', surname.value);
          localStorage.setItem('telephoneNumber', telephoneNumber.value);
          localStorage.setItem('appeal', appeal.value);
          console.log(2);
        }
      }
    });
  }

  window.addEventListener("keydown", function (evt) {
    if (evt.keyCode === 27) {
      evt.preventDefault();
      if (popup) {
        if (popup.classList.contains('popup--show')) {
          popup.classList.remove('popup--show');
          body.classList.remove('popup-lettter');
          if (popup.classList.contains('popup--error') === true) {
            popup.classList.remove('popup--error');
          }
        }
      }
    }
  });

})();
