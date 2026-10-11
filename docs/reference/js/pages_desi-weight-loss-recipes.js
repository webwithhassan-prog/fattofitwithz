
(function () {

  const PDF_URL =
    "https://cdn.shopify.com/s/files/1/0786/8507/7659/files/Desi_Weight_Loss_Recipes_Shopify.pdf?v=1790575367";

  const pagesContainer =
    document.getElementById("desi-recipes-pages");

  const loading =
    document.getElementById("desi-recipes-loading");

  if (!pagesContainer || !loading) {
    return;
  }


  /* =========================================================
     LOAD PDF.JS
     ========================================================= */

  function loadPdfJs(callback) {

    if (window.pdfjsLib) {
      callback();
      return;
    }

    const script =
      document.createElement("script");

    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";

    script.onload = callback;

    script.onerror = function () {

      loading.innerHTML =
        "Unable to load the recipe pages.";

      loading.className =
        "desi-recipes-error";

    };

    document.head.appendChild(script);

  }


  /* =========================================================
     RENDER PDF
     ========================================================= */

  function renderRecipes() {

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";


    pdfjsLib
      .getDocument({
        url: PDF_URL
      })
      .promise
      .then(function (pdf) {

        loading.style.display = "none";


        /*
         * Create all 101 page containers.
         * Pages are rendered only when they become visible.
         */

        const pageElements = [];


        for (
          let pageNumber = 1;
          pageNumber <= pdf.numPages;
          pageNumber++
        ) {

          const pageWrapper =
            document.createElement("div");

          pageWrapper.className =
            "desi-recipe-page";

          pageWrapper.dataset.page =
            pageNumber;


          const canvas =
            document.createElement("canvas");

          pageWrapper.appendChild(canvas);

          pagesContainer.appendChild(pageWrapper);

          pageElements.push({
            wrapper: pageWrapper,
            canvas: canvas,
            pageNumber: pageNumber,
            rendered: false
          });

        }


        /* =====================================================
           RENDER INDIVIDUAL PAGE
           ===================================================== */

        function renderPage(item) {

          if (item.rendered) {
            return;
          }

          item.rendered = true;


          pdf
            .getPage(item.pageNumber)
            .then(function (page) {

              const containerWidth =
                item.wrapper.clientWidth ||
                window.innerWidth;


              const baseViewport =
                page.getViewport({
                  scale: 1
                });


              const scale =
                containerWidth /
                baseViewport.width;


              const viewport =
                page.getViewport({
                  scale: scale
                });


              const canvas =
                item.canvas;

              const context =
                canvas.getContext("2d");


              const pixelRatio =
                Math.min(
                  window.devicePixelRatio || 1,
                  2
                );


              canvas.width =
                Math.floor(
                  viewport.width *
                  pixelRatio
                );

              canvas.height =
                Math.floor(
                  viewport.height *
                  pixelRatio
                );


              canvas.style.width =
                Math.floor(
                  viewport.width
                ) + "px";

              canvas.style.height =
                Math.floor(
                  viewport.height
                ) + "px";


              context.setTransform(
                pixelRatio,
                0,
                0,
                pixelRatio,
                0,
                0
              );


              return page.render({
                canvasContext: context,
                viewport: viewport
              }).promise;

            })
            .catch(function () {

              item.wrapper.innerHTML =
                "";

            });

        }


        /* =====================================================
           LAZY LOAD PAGES
           ===================================================== */

        if ("IntersectionObserver" in window) {

          const observer =
            new IntersectionObserver(
              function (entries) {

                entries.forEach(
                  function (entry) {

                    if (entry.isIntersecting) {

                      const index =
                        Number(
                          entry.target.dataset.page
                        ) - 1;

                      if (
                        pageElements[index]
                      ) {

                        renderPage(
                          pageElements[index]
                        );

                      }

                      observer.unobserve(
                        entry.target
                      );

                    }

                  }
                );

              },
              {
                rootMargin:
                  "1200px 0px"
              }
            );


          pageElements.forEach(
            function (item) {

              observer.observe(
                item.wrapper
              );

            }
          );

        } else {

          pageElements.forEach(
            function (item) {

              renderPage(item);

            }
          );

        }


        /* =====================================================
           RENDER FIRST PAGES IMMEDIATELY
           ===================================================== */

        for (
          let i = 0;
          i < Math.min(3, pageElements.length);
          i++
        ) {

          renderPage(
            pageElements[i]
          );

        }

      })
      .catch(function () {

        loading.style.display =
          "block";

        loading.innerHTML =
          "Unable to load the recipe pages. Please refresh the page.";

        loading.className =
          "desi-recipes-error";

      });

  }


  /* =========================================================
     START
     ========================================================= */

  loadPdfJs(
    renderRecipes
  );

})();
