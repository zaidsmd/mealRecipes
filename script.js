let lastArray ;
let searchInput = document.querySelector('#search-bar');
let contentContainer = document.querySelector('#content');
for (let i = 0; i < 6; i++) {
    getDataFromApi('https://www.themealdb.com/api/json/v1/1/random.php').then((response) => {
        showInCards(response);
    });
}
searchInput.addEventListener('keypress',(e)=>{
    if (e.key === "Enter"){
        getDataFromApi(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput.value.trim()}`).then((response)=>{
            contentContainer.innerHTML=''
            showInCards(response)
        })
    }
})
document.querySelector('#search-btn').addEventListener('click',()=>{
        getDataFromApi(`https://www.themealdb.com/api/json/v1/1/search.php?s=${searchInput.value.trim()}`).then((response)=>{
            contentContainer.innerHTML=''
            showInCards(response)
        })
})
//==========Functions=================
function recipeMe(data) {
    let meal = data.meals[0]
    document.querySelector("#modal-label").innerHTML = meal.strMeal;
    let modalBody = document.querySelector('.modal-body');
    modalBody.innerHTML = '';
    let image = document.createElement('img');
    image.setAttribute('src', `${meal.strMealThumb}`);
    image.setAttribute('class', 'card-img-top img-fluid');
    image.setAttribute('alt', 'meal thumbnail');
    modalBody.append(image);
    let instructionsTitle = document.createElement('h5')
    instructionsTitle.append('Instructions');
    instructionsTitle.classList.add('mt-4')
    modalBody.append(instructionsTitle)
    let instructions =document.createElement('p');
    instructions.append(meal.strInstructions);
    modalBody.append(instructions);
    let ingredientTitle = document.createElement('h5');
    ingredientTitle.append('Ingredients');
    modalBody.append(ingredientTitle);
    let ingredients = document.createElement('ul');
    for (let i = 1; i <=20 ; i++) {
        let mesure = "strMeasure"+i;
        let ingredient = "strIngredient"+i;
        if (meal[mesure] !== "" && meal[mesure]!== null && meal[mesure]!== " "){
            let li = document.createElement('li');
            li.append(`${meal[ingredient]}: ${meal[mesure]}`)
            ingredients.append(li);
        }
    }
    modalBody.append(ingredients);
}
function showInCards(data,indexOfArray=0) {
    lastArray =[];
    let firstIndex = 0;
    let lasIndex = 6;
    if (data.meals == null){
        contentContainer.innerHTML = "";
        let img = document.createElement('img');
        img.setAttribute('src','img/stir-fry.png');
        img.setAttribute('alt','error-sticker');
        img.classList.add('opacity-50')
        img.style.width = "300px";
        contentContainer.append(img)
        let notFound = document.createElement('h4')
        notFound.append("There is still no recipe for your demand we will try to add it soon");
        notFound.setAttribute('class','opacity-50 text-center')
        contentContainer.append(notFound);
        document.querySelector('#pagination').innerHTML = '';
    }else  {
        for (let i = 0; i < Math.ceil(data.meals.length / 6); i++) { // slice the array of data into smaller arrays in which every one of them represent a page
            if (lasIndex > data.meals.length) { // check if the last index is greater than the array length
                lasIndex = data.meals.length
            }
            lastArray.push(data.meals.slice(firstIndex, lasIndex));
            lasIndex += 6;
            firstIndex += 6;
        }
        lastArray[indexOfArray].forEach((meal) => {
            let card = document.createElement('div');
            card.setAttribute('class', 'p-0 card col-xl-3 col-sm-8 col-md-5 col-lg-4');
            let image = document.createElement('img');
            image.setAttribute('src', `${meal.strMealThumb}`);
            image.setAttribute('class', 'card-img-top img-fluid');
            image.setAttribute('alt', 'meal thumbnail');
            card.append(image);
            let cardBody = document.createElement('div');
            cardBody.setAttribute('class', 'card-body d-flex flex-column justify-content-between');
            let cardTitle = document.createElement('h5');
            cardTitle.setAttribute('class', 'card-title');
            cardTitle.append(meal.strMeal);
            cardBody.append(cardTitle);
            let buttonContainer = document.createElement('div');
            buttonContainer.setAttribute('class', 'w-100 mt-4 d-flex justify-content-center align-items-center');
            let button = document.createElement('button');
            button.setAttribute('class', 'btn btn-primary');
            button.setAttribute('data-bs-toggle', 'modal');
            button.setAttribute('data-bs-target', '#recipeModal');
            button.setAttribute('type', 'button');
            button.append('Show The Recipe');
            button.setAttribute('data-id', meal.idMeal);
            button.addEventListener('click',(e)=>{
                getDataFromApi(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${e.target.dataset.id}`).then((response)=>{
                    recipeMe(response)
                })
            })
            buttonContainer.append(button);
            cardBody.append(buttonContainer);
            card.append(cardBody)
            contentContainer.append(card);
        })
        createPages(data.meals,indexOfArray)
    }
}
function getDataFromApi(url,) {
    return fetch(url)
        .then(async (response) => {
            Array = await response.json();
            return Array
        })
}
function extract(arrayToExtract) {
    let extractedArray = {
        meals :[]
    };
    arrayToExtract.forEach(e => {
        e.forEach(e => {
            extractedArray.meals.push(e);
        })
    })
    return extractedArray
}
function createPages(data, indexOfData) {
    let numberOfPage = Math.ceil(data.length / 6); // here we divide the array length by number of rows that we want and then ceil the result to make the number integer
    let ul = document.createElement('ul');
    ul.classList.add('pagination');
    let previous = document.createElement("li");
    previous.classList.add('page-item');
    let a = document.createElement('a');
    a.classList.add('page-link');
    a.append('«');
    if (indexOfData === 0) {
        previous.classList.add('disabled')
    } else { //this statement here is to test the page shown is it the first if so the previous button should be disabled bcs there is no previous page
        a.addEventListener('click', () => {
            contentContainer.innerHTML="";
            showInCards(extract(lastArray), document.querySelector('#pagination .active').dataset.page - 2); // this is just call to the show  and extract functions
        });
    }
    previous.append(a);
    ul.append(previous);
    for (let i = 0; i < numberOfPage; i++) {
        let li = document.createElement('li');
        li.classList.add('page-item');
        let a = document.createElement('a');
        a.classList.add('page-link');
        a.classList.add('d-none')
        a.append(`${i + 1}/${numberOfPage}`)
        a.setAttribute('data-page',`${i + 1}`)
        li.append(a);
        ul.append(li);
    }
    let next = document.createElement('li');
    next.classList.add('page-item');
    let nextA = document.createElement('a');
    nextA.classList.add('page-link');
    nextA.append('»')
    next.append(nextA);
    ul.append(next);
    document.querySelector('#pagination').innerHTML = '';
    document.querySelector('#pagination').append(ul);
    document.querySelector(`#pagination li:nth-child(${indexOfData + 2})>a`).classList.add('active')
    document.querySelector(`#pagination li:nth-child(${indexOfData + 2})>a`).classList.remove('d-none')
    if (document.querySelector(`#pagination li:nth-child(${indexOfData + 2}) a`).dataset.page == numberOfPage) {
        document.querySelector('#pagination li:last-child').classList.add('disabled')
    } else {//this statement here is to test the page shown is it the last if so the next button should be disabled bcs there is no next page
        document.querySelector('#pagination li:last-child').addEventListener('click', () => {
            contentContainer.innerHTML="";
            showInCards(extract(lastArray), +document.querySelector(`#pagination .active`).dataset.page);
        });
    }

}

// ============= design ========================
window.onscroll = () => {
    if (scrollY >= 200) {
        document.querySelector('nav.navbar').classList.add('scrolled');
    } else {
        document.querySelector('nav.navbar').classList.remove('scrolled');
    }
}
document.querySelector('nav.navbar button').addEventListener('click', () => {
    document.querySelectorAll('#offcanvasNavbar .nav-link').forEach((link) => {
        link.classList.add('side');
    })
    document.querySelector('.offcanvas-backdrop').addEventListener('click', () => {
        removeSideClass()
    })
})
document.querySelector('#offcanvasNavbar button').addEventListener('click', () => {
    removeSideClass()
})

function removeSideClass() {
    document.querySelectorAll('#offcanvasNavbar .nav-link').forEach((link) => {
        link.classList.remove('side');
    })
}
