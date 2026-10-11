
(function(){

  function initFTFPrograms(){

    const section=document.getElementById('ftf-programs');

    if(!section)return;

    if(section.dataset.initialized==='true')return;

    section.dataset.initialized='true';

    const track=section.querySelector('.ftf-track');
    const cards=Array.from(section.querySelectorAll('.ftf-card'));
    const prevBtn=section.querySelector('.ftf-prev');
    const nextBtn=section.querySelector('.ftf-next');
    const dotsContainer=section.querySelector('.ftf-dots');
    const countrySelect=section.querySelector('#ftf-country');

    let currentIndex=0;


    /*
      FAT LOSS PROGRAM PRICES

      fatLoss2 = 2 Months
      fatLoss4 = 4 Months
    */

    const prices={

      usa:{
        kickstart:'$15',
        fatLoss2:'$27',
        fatLoss4:'$49',
        diabetes:'$39',
        health:'$39',
        total:'$69',
        premium:'$69'
      },


      canada:{
        kickstart:'CAD 21',
        fatLoss2:'CAD 38',
        fatLoss4:'CAD 69',
        diabetes:'CAD 54',
        health:'CAD 54',
        total:'CAD 95',
        premium:'CAD 95'
      },


      uae:{
        kickstart:'AED 55',
        fatLoss2:'AED 99',
        fatLoss4:'AED 179',
        diabetes:'AED 145',
        health:'AED 145',
        total:'AED 255',
        premium:'AED 255'
      },


      saudi:{
        kickstart:'SAR 55',
        fatLoss2:'SAR 100',
        fatLoss4:'SAR 185',
        diabetes:'SAR 145',
        health:'SAR 145',
        total:'SAR 260',
        premium:'SAR 260'
      },


      qatar:{
        kickstart:'QAR 55',
        fatLoss2:'QAR 99',
        fatLoss4:'QAR 179',
        diabetes:'QAR 145',
        health:'QAR 145',
        total:'QAR 255',
        premium:'QAR 255'
      },


      india:{
        kickstart:'₹1,499',
        fatLoss2:'₹2,299',
        fatLoss4:'₹4,699',
        diabetes:'₹3,299',
        health:'₹3,299',
        total:'₹5,999',
        premium:'₹5,999'
      },


      pakistan:{
        kickstart:'Rs. 4,000',
        fatLoss2:'Rs. 7,000',
        fatLoss4:'Rs. 13,600',
        diabetes:'Rs. 9,999',
        health:'Rs. 9,999',
        total:'Rs. 18,500',
        premium:'Rs. 18,500'
      },


      australia:{
        kickstart:'AUD 22',
        fatLoss2:'AUD 40',
        fatLoss4:'AUD 70',
        diabetes:'AUD 58',
        health:'AUD 58',
        total:'AUD 102',
        premium:'AUD 102'
      }

    };


    function getVisibleCards(){

      if(window.innerWidth<=650)return 1;

      if(window.innerWidth<=990)return 2;

      return 3;

    }


    function getMaxIndex(){

      return Math.max(
        0,
        cards.length-getVisibleCards()
      );

    }


    function buildDots(){

      dotsContainer.innerHTML='';

      const maxIndex=getMaxIndex();

      for(let i=0;i<=maxIndex;i++){

        const dot=document.createElement('button');

        dot.type='button';

        dot.className='ftf-dot';

        if(i===currentIndex){
          dot.classList.add('active');
        }

        dot.setAttribute(
          'aria-label',
          'Show programs '+(i+1)
        );

        dot.addEventListener(
          'click',
          function(){

            currentIndex=i;

            updateSlider();

          }
        );

        dotsContainer.appendChild(dot);

      }

    }


    function updateSlider(){

      const maxIndex=getMaxIndex();

      if(currentIndex>maxIndex){
        currentIndex=maxIndex;
      }

      const firstCard=cards[0];

      if(!firstCard)return;

      const cardWidth=
        firstCard.getBoundingClientRect().width;

      const trackStyle=
        window.getComputedStyle(track);

      const gap=
        parseFloat(
          trackStyle.columnGap||
          trackStyle.gap
        )||0;

      const movement=
        (cardWidth+gap)*currentIndex;

      track.style.transform=
        'translateX(-'+movement+'px)';

      prevBtn.disabled=currentIndex<=0;

      nextBtn.disabled=currentIndex>=maxIndex;

      const dots=
        dotsContainer.querySelectorAll('.ftf-dot');

      dots.forEach(function(dot,index){

        dot.classList.toggle(
          'active',
          index===currentIndex
        );

      });

    }


    prevBtn.addEventListener(
      'click',
      function(){

        if(currentIndex>0){

          currentIndex--;

          updateSlider();

        }

      }
    );


    nextBtn.addEventListener(
      'click',
      function(){

        const maxIndex=getMaxIndex();

        if(currentIndex<maxIndex){

          currentIndex++;

          updateSlider();

        }

      }
    );


    function updatePrices(){

      const country=countrySelect.value;

      const selected=prices[country];

      if(!selected)return;


      const kickstartPrice=
        section.querySelector(
          '[data-price-program="kickstart"]'
        );

      if(kickstartPrice){

        kickstartPrice.textContent=
          selected.kickstart;

      }


      /*
        FAT LOSS PRICE
        Always display:
        2 Months | 4 Months
      */

      const fatLossPrice=
        section.querySelector(
          '[data-price-program="fat-loss"]'
        );

      if(fatLossPrice){

        fatLossPrice.textContent=
          selected.fatLoss2+' | '+selected.fatLoss4;

      }


      const diabetesPrice=
        section.querySelector(
          '[data-price-program="diabetes"]'
        );

      if(diabetesPrice){

        diabetesPrice.textContent=
          selected.diabetes;

      }


      const healthPrice=
        section.querySelector(
          '[data-price-program="health"]'
        );

      if(healthPrice){

        healthPrice.textContent=
          selected.health;

      }


      const totalPrice=
        section.querySelector(
          '[data-price-program="total"]'
        );

      if(totalPrice){

        totalPrice.textContent=
          selected.total;

      }


      const premiumPrice=
        section.querySelector(
          '[data-price-program="premium"]'
        );

      if(premiumPrice){

        premiumPrice.textContent=
          selected.premium;

      }

    }


    countrySelect.addEventListener(
      'change',
      function(){

        updatePrices();

      }
    );


    let resizeTimer;


    window.addEventListener(
      'resize',
      function(){

        clearTimeout(resizeTimer);

        resizeTimer=setTimeout(
          function(){

            buildDots();

            updateSlider();

          },
          100
        );

      }
    );


    countrySelect.value='usa';

    updatePrices();

    buildDots();

    updateSlider();

  }


  if(document.readyState==='loading'){

    document.addEventListener(
      'DOMContentLoaded',
      initFTFPrograms
    );

  }else{

    initFTFPrograms();

  }

})();
