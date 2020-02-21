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
  const hiddenElement = document.querySelector(".consultation__block a");
  const btn = document.querySelector(".page-header__anchor");
  const hiddenElementScroll = document.querySelector(".about-company");
  const btnScroll = document.querySelector(".page-header__scroll");

  // let handleButtonClick = function (el) {
  //   el.scrollIntoView({block: "center", behavior: "smooth"});
  // };
  //
  // btn.addEventListener("click", function () {
  //   console.log(1);
  //   el.scrollIntoView({block: "center", behavior: "smooth"});
  //   handleButtonClick(hiddenElement);
  // });
  //
  // btnScroll.addEventListener("click", function () {
  //   console.log(1);
  //   handleButtonClick(hiddenElementScroll);
  // });

  let handleButtonClick = function(element) {
    element.scrollIntoView({block: "center", behavior: "smooth"});
  };

  btn.addEventListener('click', function () {
    handleButtonClick(hiddenElement);
  },

  // iMask
  $("#telephone").mask("+7 (999) 999-9999");
})();
