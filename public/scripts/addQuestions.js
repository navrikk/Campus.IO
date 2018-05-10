var optionContainer = document.getElementById("optionContainer");
var addOption = document.getElementById("addOption");
var removeOption = document.getElementById("removeOption");

var optionCounter = 1;

function addTextField(questionNum) {
	var divUpperElement = document.createElement("div");
	var divInnerElement = document.createElement("div");
	var option = document.createElement("div");
	var lableElement = document.createElement("Label");
	var textareaElement = document.createElement("textarea");
	var radioButton = document.createElement("input");

	radioButton.type = "radio";
	radioButton.name = "answer";
	radioButton.required = "true";
	radioButton.id = "q156";
	radioButton.className = "myRadioButton";
	radioButton.value = "option" + questionNum;

	divInnerElement.className = "input-group-prepend input-group-text";
	divUpperElement.className = "input-group";
	divInnerElement.appendChild(radioButton);
	divUpperElement.appendChild(divInnerElement);


	lableElement.setAttribute("for", "option" + questionNum);
	lableElement.appendChild(document.createTextNode("Option" + questionNum));
	
	textareaElement.type = "text";
	textareaElement.required = "true";
	textareaElement.name = "option" + questionNum;
	textareaElement.className="form-control";
	textareaElement.id="exampleFormControlTextarea1";
	textareaElement.rows="1";
	divUpperElement.appendChild(textareaElement);

	option.id = "option" + questionNum;
	option.appendChild(lableElement);
	option.appendChild(divUpperElement);
	option.appendChild(document.createElement("br"));
	optionContainer.appendChild(option);
}
addTextField(optionCounter++);
addTextField(optionCounter++);
removeOption.style.display = "none";

addOption.addEventListener('click', function() {
	addTextField(optionCounter++);
	removeOption.style.display = "block";

	if(optionCounter > 5)
		addOption.style.display = "none";
});

removeOption.addEventListener('click', function() {
	if(optionCounter > 3){
		document.getElementById("option" + (--optionCounter)).remove();
		addOption.style.display = "block";
	}
	if(optionCounter < 4){
		removeOption.style.display = "none";
	}
});