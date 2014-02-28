$(function() {
	
	// handlebar templates
	var leftPanel   = $("#leftPanel").html();
	var userListTemplate   = $("#userListTemplate").html();
	var centralTemplate   = $("#centralTemplate").html();
	
	// setup the homepage
	showHeader(headerTemplate,0);
	showContentPage(centralTemplate,theData = {mainData: homepageData, license: true});
	
	$(document).on("click", '.headerElement', function(event){
		showHeader(headerTemplate,$(this).attr('data-id')); 
		if ($(this).attr('data-id') == 0){
			theData = {
				mainData: homepageData,
				license: true
			}
			showContentPage(centralTemplate,theData);
		}
		if ($(this).attr('data-id') == 1){
			theData = {
				mainData: aboutData,
				author: {
					firstName: "Glyn",
					lastName: "Roberts"
				},
				people: [
					"Adam",
					"Mark",
					"Luke"
				]
			}
			showContentPage(centralTemplate,theData);
		}
		if ($(this).attr('data-id') == 2){
			showUserList(userListTemplate);
		}
	});
	
});

// All data strings listed here
var userData = { users: [
	{id: "1", firstName: "Adam", lastName: "Smith", email: "adam@test.com" },
	{id: "2", firstName: "Mark", lastName: "Jones", email: "mark@test.com" },
	{id: "3", firstName: "Luke", lastName: "Roberts", email: "luke@test.com" }
]};
var navigationData =  [
	{id: "0", name: "Home", selected: ""},
	{id: "1", name: "About", selected: ""},
	{id: "2", name: "User List", selected: ""}
];
var homepageData = "Welcome to the Handlebars template example.<br /> Click on the navigation above to see the page loading using the Handlebar library.";
var aboutData = "About Handlebar page";

function showHeader(template,selectedElement){
	navigationData[selectedElement].selected = 'selectedDiv';
	var theData = {
		headerTitle: navigationData[selectedElement].name, 
		navigation: navigationData
	};
	renderPage(template,"#header-placeholder",theData);
	navigationData[selectedElement].selected = '';
}

function showContentPage(template,contentSent){
	var theData = {
		contentSent: contentSent
	};
	renderPage(template,"#central-placeholder",theData);
}

function showUserList(template){
	renderPage(template,"#central-placeholder",userData);
}

function renderPage(template,placeHolder,theData){
	var contentTemplate = Handlebars.compile(template);
	$(placeHolder).html(contentTemplate(theData));
}

Handlebars.registerHelper('fullName', function(person) {
	return person.firstName + " " + person.lastName;
});