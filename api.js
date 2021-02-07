document.getElementById("search-button").addEventListener('click',()=>{
 
const inputMeal = document.getElementById("meal").value;
fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${inputMeal}`)
.then(res => res.json())
.then(data => showMealInfo(data));
});


// -------------recipe details

function recipeDetails(mealId){
    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`)
    .then(res => res.json())
    .then(data => {
        displayIngredient(data.meals[0]);
    })
}



// ----------showing meal info

const showMealInfo=data=>{
    const mealDiv=document.getElementById("meals");
    let mealValue="";
    if(data.meals){
    data.meals.forEach(meal => {
        mealValue=mealValue+`<div onclick="recipeDetails('${meal.idMeal}')"
         class="meals"><img src="${meal.strMealThumb}">
         <h3 >${meal.strMeal}</h3></div>`;
    });
}
else{
    mealValue="invalid text";
    
}

        mealDiv.innerHTML=mealValue;
}


// ------display ingredient

const displayIngredient = meal=>{
    console.log(meal);
    const ingredientDisplay= document.getElementById("ingredient");
    ingredientDisplay.innerHTML =`
    <div class="extra">
    <img id="image" src="${meal.strMealThumb}">
    <h1> ${meal.strMeal}</h1>
    <h3>ingredients</h3>
    <li>${meal.strMeasure1}${meal.strIngredient1}</li>
    <li>${meal.strMeasure2}${meal.strIngredient2}</li>
    <li>${meal.strMeasure3}${meal.strIngredient3}</li>
    <li>${meal.strMeasure4}${meal.strIngredient4}</li>
    <li>${meal.strMeasure5}${meal.strIngredient5}</li>
    <li>${meal.strMeasure6}${meal.strIngredient6}</li>
    <li>${meal.strMeasure7}${meal.strIngredient7}</li>
    <li>${meal.strMeasure8}${meal.strIngredient8}</li>
    </div>
    `;
    
    }

