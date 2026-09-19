/*
 * easy-autocomplete
 * jQuery plugin for autocompletion
 * 
 * @author Łukasz Pawełczak (http://github.com/pawelczak)
 * @version 1.3.5
 * Copyright  License: 
 */

/*
 * EasyAutocomplete - Configuration 
 */
var EasyAutocomplete = (function(scope){

	scope.Configuration = function Configuration(options) {
		var defaults = {
			data: "list-required",
			url: "list-required",
			dataType: "json",

			listLocation: function(data) {
				return data;
			},

			xmlElementName: "",

			getValue: function(element) {
				return element;
			},

			autocompleteOff: true,

			placeholder: false,

			ajaxCallback: function() {},

			matchResponseProperty: false,

			list: {
				sort: {
					enabled: false,
					method: function(a, b) {
						a = defaults.getValue(a);
						b = defaults.getValue(b);
						if (a < b) {
							return -1;
						}
						if (a > b) {
							return 1;
						}
						return 0;
					}
				},

				maxNumberOfElements: 6,

				hideOnEmptyPhrase: true,

				match: {
					enabled: false,
					caseSensitive: false,
					method: function(element, phrase) {

						if (element.search(phrase) > -1) {
							return true;
						} else {
							return false;
						}
					}
				},

				showAnimation: {
					type: "normal", //normal|slide|fade
					time: 400,
					callback: function() {}
				},

				hideAnimation: {
					type: "normal",
					time: 400,
					callback: function() {}
				},

				/* Events */
				onClickEvent: function() {},
				onSelectItemEvent: function() {},
				onLoadEvent: function() {},
				onChooseEvent: function() {},
				onKeyEnterEvent: function() {},
				onMouseOverEvent: function() {},
				onMouseOutEvent: function() {},	
				onShowListEvent: function() {},
				onHideListEvent: function() {}
			},

			highlightPhrase: true,

			theme: "",

			cssClasses: "",

			minCharNumber: 0,

			requestDelay: 0,

			adjustWidth: true,

			ajaxSettings: {},

			preparePostData: function(data, inputPhrase) {return data;},

			loggerEnabled: true,

			template: "",

			categoriesAssigned: false,

			categories: [{
				maxNumberOfElements: 4
			}]

		};
		
		var externalObjects = ["ajaxSettings", "template"];

		this.get = function(propertyName) {
			return defaults[propertyName];
		};

		this.equals = function(name, value) {
			if (isAssigned(name)) {
				if (defaults[name] === value) {
					return true;
				}
			} 
			
			return false;
		};

		this.checkDataUrlProperties = function() {
			if (defaults.url === "list-required" && defaults.data === "list-required") {
				return false;
			}
			return true;
		};
		this.checkRequiredProperties = function() {
			for (var propertyName in defaults) {
				if (defaults[propertyName] === "required") {
					logger.error("Option " + propertyName + " must be defined");
					return false;
				}
			}
			return true;
		};

		this.printPropertiesThatDoesntExist = function(consol, optionsToCheck) {
			printPropertiesThatDoesntExist(consol, optionsToCheck);
		};


		prepareDefaults();

		mergeOptions();

		if (defaults.loggerEnabled === true) {
			printPropertiesThatDoesntExist(console, options);	
		}

		addAjaxSettings();

		processAfterMerge();
		function prepareDefaults() {

			if (options.dataType === "xml") {
				
				if (!options.getValue) {

					options.getValue = function(element) {
						return $(element).text();
					};
				}

				
				if (!options.list) {

					options.list = {};
				} 

				if (!options.list.sort) {
					options.list.sort = {};
				}


				options.list.sort.method = function(a, b) {
					a = options.getValue(a);
					b = options.getValue(b);
					if (a < b) {
						return -1;
					}
					if (a > b) {
						return 1;
					}
					return 0;
				};

				if (!options.list.match) {
					options.list.match = {};
				}

				options.list.match.method = function(element, phrase) {

					if (element.search(phrase) > -1) {
						return true;
					} else {
						return false;
					}
				};

			}
			if (options.categories !== undefined && options.categories instanceof Array) {

				var categories = [];

				for (var i = 0, length = options.categories.length; i < length; i += 1) { 

					var category = options.categories[i];

					for (var property in defaults.categories[0]) {

						if (category[property] === undefined) {
							category[property] = defaults.categories[0][property];
						}
					}

					categories.push(category);
				}

				options.categories = categories;
			}
		}

		function mergeOptions() {

			defaults = mergeObjects(defaults, options);

			function mergeObjects(source, target) {
				var mergedObject = source || {};

				for (var propertyName in source) {
					if (target[propertyName] !== undefined && target[propertyName] !== null) {

						if (typeof target[propertyName] !== "object" || 
								target[propertyName] instanceof Array) {
							mergedObject[propertyName] = target[propertyName];
						} else {
							mergeObjects(source[propertyName], target[propertyName]);
						}
					}
				}
			
				/* If data is an object */
				if (target.data !== undefined && target.data !== null && typeof target.data === "object") {
					mergedObject.data = target.data;
				}

				return mergedObject;
			}
		}	


		function processAfterMerge() {
			
			if (defaults.url !== "list-required" && typeof defaults.url !== "function") {
				var defaultUrl = defaults.url;
				defaults.url = function() {
					return defaultUrl;
				};
			}

			if (defaults.ajaxSettings.url !== undefined && typeof defaults.ajaxSettings.url !== "function") {
				var defaultUrl = defaults.ajaxSettings.url;
				defaults.ajaxSettings.url = function() {
					return defaultUrl;
				};
			}

			if (typeof defaults.listLocation === "string") {
				var defaultlistLocation = defaults.listLocation;

				if (defaults.dataType.toUpperCase() === "XML") {
					defaults.listLocation = function(data) {
						return $(data).find(defaultlistLocation);
					};
				} else {
					defaults.listLocation = function(data) {
						return data[defaultlistLocation];
					};	
				}
			}

			if (typeof defaults.getValue === "string") {
				var defaultsGetValue = defaults.getValue;
				defaults.getValue = function(element) {
					return element[defaultsGetValue];
				};
			}

			if (options.categories !== undefined) {
				defaults.categoriesAssigned = true;
			}

		}

		function addAjaxSettings() {

			if (options.ajaxSettings !== undefined && typeof options.ajaxSettings === "object") {
				defaults.ajaxSettings = options.ajaxSettings;
			} else {
				defaults.ajaxSettings = {};	
			}
			
		}

		function isAssigned(name) {
			if (defaults[name] !== undefined && defaults[name] !== null) {
				return true;
			} else {
				return false;
			}
		}
		function printPropertiesThatDoesntExist(consol, optionsToCheck) {
			
			checkPropertiesIfExist(defaults, optionsToCheck);

			function checkPropertiesIfExist(source, target) {
				for(var property in target) {
					if (source[property] === undefined) {
						consol.log("Property '" + property + "' does not exist in EasyAutocomplete options API.");		
					}

					if (typeof source[property] === "object" && $.inArray(property, externalObjects) === -1) {
						checkPropertiesIfExist(source[property], target[property]);
					}
				}	
			}
		}
	};

	return scope;

})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - Logger 
 */
var EasyAutocomplete = (function(scope){
	
	scope.Logger = function Logger() {

		this.error = function(message) {
			console.log("ERROR: " + message);
		};

		this.warning = function(message) {
			console.log("WARNING: " + message);
		};
	};

	return scope;

})(EasyAutocomplete || {});
	

/*
 * EasyAutocomplete - Constans
 */
var EasyAutocomplete = (function(scope){	
	
	scope.Constans = function Constans() {
		var constants = {
			CONTAINER_CLASS: "easy-autocomplete-container",
			CONTAINER_ID: "eac-container-",

			WRAPPER_CSS_CLASS: "easy-autocomplete"
		};

		this.getValue = function(propertyName) {
			return constants[propertyName];
		};

	};

	return scope;

})(EasyAutocomplete || {});

/*
 * EasyAutocomplete - ListBuilderService 
 *
 * @author Łukasz Pawełczak 
 *
 */
var EasyAutocomplete = (function(scope) {

	scope.ListBuilderService = function ListBuilderService(configuration, proccessResponseData) {


		this.init = function(data) {
			var listBuilder = [],
				builder = {};

			builder.data = configuration.get("listLocation")(data);
			builder.getValue = configuration.get("getValue");
			builder.maxListSize = configuration.get("list").maxNumberOfElements;

				
			listBuilder.push(builder);

			return listBuilder;
		};

		this.updateCategories = function(listBuilder, data) {
			
			if (configuration.get("categoriesAssigned")) {

				listBuilder = [];

				for(var i = 0; i < configuration.get("categories").length; i += 1) {

					var builder = convertToListBuilder(configuration.get("categories")[i], data);

					listBuilder.push(builder);
				}

			} 

			return listBuilder;
		};

		this.convertXml = function(listBuilder) {
			if(configuration.get("dataType").toUpperCase() === "XML") {

				for(var i = 0; i < listBuilder.length; i += 1) {
					listBuilder[i].data = convertXmlToList(listBuilder[i]);
				}
			}

			return listBuilder;
		};

		this.processData = function(listBuilder, inputPhrase) {

			for(var i = 0, length = listBuilder.length; i < length; i+=1) {
				listBuilder[i].data = proccessResponseData(configuration, listBuilder[i], inputPhrase);
			}

			return listBuilder;
		};

		this.checkIfDataExists = function(listBuilders) {

			for(var i = 0, length = listBuilders.length; i < length; i += 1) {

				if (listBuilders[i].data !== undefined && listBuilders[i].data instanceof Array) {
					if (listBuilders[i].data.length > 0) {
						return true;
					}
				} 
			}

			return false;
		};


		function convertToListBuilder(category, data) {

			var builder = {};

			if(configuration.get("dataType").toUpperCase() === "XML") {

				builder = convertXmlToListBuilder();
			} else {

				builder = convertDataToListBuilder();
			}
			

			if (category.header !== undefined) {
				builder.header = category.header;
			}

			if (category.maxNumberOfElements !== undefined) {
				builder.maxNumberOfElements = category.maxNumberOfElements;
			}

			if (configuration.get("list").maxNumberOfElements !== undefined) {

				builder.maxListSize = configuration.get("list").maxNumberOfElements;
			}

			if (category.getValue !== undefined) {

				if (typeof category.getValue === "string") {
					var defaultsGetValue = category.getValue;
					builder.getValue = function(element) {
						return element[defaultsGetValue];
					};
				} else if (typeof category.getValue === "function") {
					builder.getValue = category.getValue;
				}

			} else {
				builder.getValue = configuration.get("getValue");	
			}
			

			return builder;


			function convertXmlToListBuilder() {

				var builder = {},
					listLocation;

				if (category.xmlElementName !== undefined) {
					builder.xmlElementName = category.xmlElementName;
				}

				if (category.listLocation !== undefined) {

					listLocation = category.listLocation;
				} else if (configuration.get("listLocation") !== undefined) {

					listLocation = configuration.get("listLocation");
				}

				if (listLocation !== undefined) {
					if (typeof listLocation === "string") {
						builder.data = $(data).find(listLocation);
					} else if (typeof listLocation === "function") {

						builder.data = listLocation(data);
					}
				} else {

					builder.data = data;
				}

				return builder;
			}


			function convertDataToListBuilder() {

				var builder = {};

				if (category.listLocation !== undefined) {

					if (typeof category.listLocation === "string") {
						builder.data = data[category.listLocation];
					} else if (typeof category.listLocation === "function") {
						builder.data = category.listLocation(data);
					}
				} else {
					builder.data = data;
				}

				return builder;
			}
		}

		function convertXmlToList(builder) {
			var simpleList = [];

			if (builder.xmlElementName === undefined) {
				builder.xmlElementName = configuration.get("xmlElementName");
			}


			$(builder.data).find(builder.xmlElementName).each(function() {
				simpleList.push(this);
			});

			return simpleList;
		}

	};

	return scope;

})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - Data proccess module
 *
 * Process list to display:
 * - sort 
 * - decrease number to specific number
 * - show only matching list
 *
 */
var EasyAutocomplete = (function(scope) {

	scope.proccess = function proccessData(config, listBuilder, phrase) {

		scope.proccess.match = match;

		var list = listBuilder.data,
			inputPhrase = phrase;//TODO REFACTOR

		list = findMatch(list, inputPhrase);
		list = reduceElementsInList(list);
		list = sort(list);

		return list;


		function findMatch(list, phrase) {
			var preparedList = [],
				value = "";

			if (config.get("list").match.enabled) {

				for(var i = 0, length = list.length; i < length; i += 1) {

					value = config.get("getValue")(list[i]);
					
					if (match(value, phrase)) {
						preparedList.push(list[i]);	
					}
					
				}

			} else {
				preparedList = list;
			}

			return preparedList;
		}

		function match(value, phrase) {

			if (!config.get("list").match.caseSensitive) {

				if (typeof value === "string") {
					value = value.toLowerCase();	
				}
				
				phrase = phrase.toLowerCase();
			}
			if (config.get("list").match.method(value, phrase)) {
				return true;
			} else {
				return false;
			}
		}

		function reduceElementsInList(list) {
			if (listBuilder.maxNumberOfElements !== undefined && list.length > listBuilder.maxNumberOfElements) {
				list = list.slice(0, listBuilder.maxNumberOfElements);
			}

			return list;
		}

		function sort(list) {
			if (config.get("list").sort.enabled) {
				list.sort(config.get("list").sort.method);
			}

			return list;
		}
		
	};


	return scope;


})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - Template 
 *
 * 
 *
 */
var EasyAutocomplete = (function(scope){

	scope.Template = function Template(options) {


		var genericTemplates = {
			basic: {
				type: "basic",
				method: function(element) { return element; },
				cssClass: ""
			},
			description: {
				type: "description",
				fields: {
					description: "description"
				},
				method: function(element) {	return element + " - description"; },
				cssClass: "eac-description"
			},
			iconLeft: {
				type: "iconLeft",
				fields: {
					icon: ""
				},
				method: function(element) {
					return element;
				},
				cssClass: "eac-icon-left"
			},
			iconRight: {
				type: "iconRight",
				fields: {
					iconSrc: ""
				},
				method: function(element) {
					return element;
				},
				cssClass: "eac-icon-right"
			},
			links: {
				type: "links",
				fields: {
					link: ""
				},
				method: function(element) {
					return element;
				},
				cssClass: ""
			},
			custom: {
				type: "custom",
				method: function() {},
				cssClass: ""
			}
		},



		/*
		 * Converts method with {{text}} to function
		 */
		convertTemplateToMethod = function(template) {


			var _fields = template.fields,
				buildMethod;

			if (template.type === "description") {

				buildMethod = genericTemplates.description.method; 

				if (typeof _fields.description === "string") {
					buildMethod = function(elementValue, element) {
						return elementValue + " - <span>" + element[_fields.description] + "</span>";
					};					
				} else if (typeof _fields.description === "function") {
					buildMethod = function(elementValue, element) {
						return elementValue + " - <span>" + _fields.description(element) + "</span>";
					};	
				}

				return buildMethod;
			}

			if (template.type === "iconRight") {

				if (typeof _fields.iconSrc === "string") {
					buildMethod = function(elementValue, element) {
						return elementValue + "<img class='eac-icon' src='" + element[_fields.iconSrc] + "' />" ;
					};					
				} else if (typeof _fields.iconSrc === "function") {
					buildMethod = function(elementValue, element) {
						return elementValue + "<img class='eac-icon' src='" + _fields.iconSrc(element) + "' />" ;
					};
				}

				return buildMethod;
			}


			if (template.type === "iconLeft") {

				if (typeof _fields.iconSrc === "string") {
					buildMethod = function(elementValue, element) {
						return "<img class='eac-icon' src='" + element[_fields.iconSrc] + "' />" + elementValue;
					};					
				} else if (typeof _fields.iconSrc === "function") {
					buildMethod = function(elementValue, element) {
						return "<img class='eac-icon' src='" + _fields.iconSrc(element) + "' />" + elementValue;
					};
				}

				return buildMethod;
			}

			if(template.type === "links") {

				if (typeof _fields.link === "string") {
					buildMethod = function(elementValue, element) {
						return "<a href='" + element[_fields.link] + "' >" + elementValue + "</a>";
					};					
				} else if (typeof _fields.link === "function") {
					buildMethod = function(elementValue, element) {
						return "<a href='" + _fields.link(element) + "' >" + elementValue + "</a>";
					};
				}

				return buildMethod;
			}


			if (template.type === "custom") {

				return template.method;
			}

			return genericTemplates.basic.method;

		},


		prepareBuildMethod = function(options) {
			if (!options || !options.type) {

				return genericTemplates.basic.method;
			}

			if (options.type && genericTemplates[options.type]) {

				return convertTemplateToMethod(options);
			} else {

				return genericTemplates.basic.method;
			}

		},

		templateClass = function(options) {
			var emptyStringFunction = function() {return "";};

			if (!options || !options.type) {

				return emptyStringFunction;
			}

			if (options.type && genericTemplates[options.type]) {
				return (function () { 
					var _cssClass = genericTemplates[options.type].cssClass;
					return function() { return _cssClass;};
				})();
			} else {
				return emptyStringFunction;
			}
		};


		this.getTemplateClass = templateClass(options);

		this.build = prepareBuildMethod(options);


	};

	return scope;

})(EasyAutocomplete || {});


/*
 * EasyAutocomplete - jQuery plugin for autocompletion
 *
 */
var EasyAutocomplete = (function(scope) {

	
	scope.main = function Core($input, options) {
				
		var module = {
				name: "EasyAutocomplete",
				shortcut: "eac"
			};

		var consts = new scope.Constans(),
			config = new scope.Configuration(options),
			logger = new scope.Logger(),
			template = new scope.Template(options.template),
			listBuilderService = new scope.ListBuilderService(config, scope.proccess),
			checkParam = config.equals,

			$field = $input, 
			$container = "",
			elementsList = [],
			selectedElement = -1,
			requestDelayTimeoutId;

		scope.consts = consts;

		this.getConstants = function() {
			return consts;
		};

		this.getConfiguration = function() {
			return config;
		};

		this.getContainer = function() {
			return $container;
		};

		this.getSelectedItemIndex = function() {
			return selectedElement;
		};

		this.getItems = function () {
			return elementsList;
		};

		this.getItemData = function(index) {

			if (elementsList.length < index || elementsList[index] === undefined) {
				return -1;
			} else {
				return elementsList[index];
			}
		};

		this.getSelectedItemData = function() {
			return this.getItemData(selectedElement);
		};

		this.build = function() {
			prepareField();
		};

		this.init = function() {
			init();
		};
		function init() {

			if ($field.length === 0) {
				logger.error("Input field doesn't exist.");
				return;
			}

			if (!config.checkDataUrlProperties()) {
				logger.error("One of options variables 'data' or 'url' must be defined.");
				return;
			}

			if (!config.checkRequiredProperties()) {
				logger.error("Will not work without mentioned properties.");
				return;
			}


			prepareField();
			bindEvents();	

		}
		function prepareField() {

				
			if ($field.parent().hasClass(consts.getValue("WRAPPER_CSS_CLASS"))) {
				removeContainer();
				removeWrapper();
			} 
			
			createWrapper();
			createContainer();	

			$container = $("#" + getContainerId());
			if (config.get("placeholder")) {
				$field.attr("placeholder", config.get("placeholder"));
			}


			function createWrapper() {
				var $wrapper = $("<div>"),
					classes = consts.getValue("WRAPPER_CSS_CLASS");

			
				if (config.get("theme") && config.get("theme") !== "") {
					classes += " eac-" + config.get("theme");
				}

				if (config.get("cssClasses") && config.get("cssClasses") !== "") {
					classes += " " + config.get("cssClasses");
				}

				if (template.getTemplateClass() !== "") {
					classes += " " + template.getTemplateClass();
				}
				

				$wrapper
					.addClass(classes);
				$field.wrap($wrapper);


				if (config.get("adjustWidth") === true) {
					adjustWrapperWidth();	
				}
				

			}

			function adjustWrapperWidth() {
				var fieldWidth = $field.outerWidth();

				$field.parent().css("width", fieldWidth);				
			}

			function removeWrapper() {
				$field.unwrap();
			}

			function createContainer() {
				var $elements_container = $("<div>").addClass(consts.getValue("CONTAINER_CLASS"));

				$elements_container
						.attr("id", getContainerId())
						.prepend($("<ul>"));


				(function() {

					$elements_container
						/* List show animation */
						.on("show.eac", function() {

							switch(config.get("list").showAnimation.type) {

								case "slide":
									var animationTime = config.get("list").showAnimation.time,
										callback = config.get("list").showAnimation.callback;

									$elements_container.find("ul").slideDown(animationTime, callback);
								break;

								case "fade":
									var animationTime = config.get("list").showAnimation.time,
										callback = config.get("list").showAnimation.callback;

									$elements_container.find("ul").fadeIn(animationTime), callback;
								break;

								default:
									$elements_container.find("ul").show();
								break;
							}

							config.get("list").onShowListEvent();
							
						})
						/* List hide animation */
						.on("hide.eac", function() {

							switch(config.get("list").hideAnimation.type) {

								case "slide":
									var animationTime = config.get("list").hideAnimation.time,
										callback = config.get("list").hideAnimation.callback;

									$elements_container.find("ul").slideUp(animationTime, callback);
								break;

								case "fade":
									var animationTime = config.get("list").hideAnimation.time,
										callback = config.get("list").hideAnimation.callback;

									$elements_container.find("ul").fadeOut(animationTime, callback);
								break;

								default:
									$elements_container.find("ul").hide();
								break;
							}

							config.get("list").onHideListEvent();

						})
						.on("selectElement.eac", function() {
							$elements_container.find("ul li").removeClass("selected");
							$elements_container.find("ul li").eq(selectedElement).addClass("selected");

							config.get("list").onSelectItemEvent();
						})
						.on("loadElements.eac", function(event, listBuilders, phrase) {
			

							var $item = "",
								$listContainer = $elements_container.find("ul");

							$listContainer
								.empty()
								.detach();

							elementsList = [];
							var counter = 0;
							for(var builderIndex = 0, listBuildersLength = listBuilders.length; builderIndex < listBuildersLength; builderIndex += 1) {

								var listData = listBuilders[builderIndex].data;

								if (listData.length === 0) {
									continue;
								}

								if (listBuilders[builderIndex].header !== undefined && listBuilders[builderIndex].header.length > 0) {
									$listContainer.append("<div class='eac-category' >" + listBuilders[builderIndex].header + "</div>");
								}

								for(var i = 0, listDataLength = listData.length; i < listDataLength && counter < listBuilders[builderIndex].maxListSize; i += 1) {
									$item = $("<li><div class='eac-item'></div></li>");
									

									(function() {
										var j = i,
											itemCounter = counter,
											elementsValue = listBuilders[builderIndex].getValue(listData[j]);

										$item.find(" > div")
											.on("click", function() {

												$field.val(elementsValue).trigger("change");

												selectedElement = itemCounter;
												selectElement(itemCounter);

												config.get("list").onClickEvent();
												config.get("list").onChooseEvent();
											})
											.mouseover(function() {

												selectedElement = itemCounter;
												selectElement(itemCounter);	

												config.get("list").onMouseOverEvent();
											})
											.mouseout(function() {
												config.get("list").onMouseOutEvent();
											})
											.html(template.build(highlight(elementsValue, phrase), listData[j]));
									})();

									$listContainer.append($item);
									elementsList.push(listData[i]);
									counter += 1;
								}
							}

							$elements_container.append($listContainer);

							config.get("list").onLoadEvent();
						});

				})();

				$field.after($elements_container);
			}

			function removeContainer() {
				$field.next("." + consts.getValue("CONTAINER_CLASS")).remove();
			}

			function highlight(string, phrase) {

				if(config.get("highlightPhrase") && phrase !== "") {
					return highlightPhrase(string, phrase);	
				} else {
					return string;
				}
					
			}

			function escapeRegExp(str) {
				return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
 			}

			function highlightPhrase(string, phrase) {
				var escapedPhrase = escapeRegExp(phrase);
				return (string + "").replace(new RegExp("(" + escapedPhrase + ")", "gi") , "<b>$1</b>");
			}



		}
		function getContainerId() {
			
			var elementId = $field.attr("id");

			elementId = consts.getValue("CONTAINER_ID") + elementId;

			return elementId;
		}
		function bindEvents() {

			bindAllEvents();
			

			function bindAllEvents() {
				if (checkParam("autocompleteOff", true)) {
					removeAutocomplete();
				}

				bindFocusOut();
				bindKeyup();
				bindKeydown();
				bindKeypress();
				bindFocus();
				bindBlur();
			}

			function bindFocusOut() {
				$field.focusout(function () {

					var fieldValue = $field.val(),
						phrase;

					if (!config.get("list").match.caseSensitive) {
						fieldValue = fieldValue.toLowerCase();
					}

					for (var i = 0, length = elementsList.length; i < length; i += 1) {

						phrase = config.get("getValue")(elementsList[i]);
						if (!config.get("list").match.caseSensitive) {
							phrase = phrase.toLowerCase();
						}

						if (phrase === fieldValue) {
							selectedElement = i;
							selectElement(selectedElement);
							return;
						}
					}
				});
			}

			function bindKeyup() {
				$field
				.off("keyup")
				.keyup(function(event) {

					switch(event.keyCode) {

						case 27:

							hideContainer();
							loseFieldFocus();
						break;

						case 38:

							event.preventDefault();

							if(elementsList.length > 0 && selectedElement > 0) {

								selectedElement -= 1;

								$field.val(config.get("getValue")(elementsList[selectedElement]));

								selectElement(selectedElement);

							}						
						break;

						case 40:

							event.preventDefault();

							if(elementsList.length > 0 && selectedElement < elementsList.length - 1) {

								selectedElement += 1;

								$field.val(config.get("getValue")(elementsList[selectedElement]));

								selectElement(selectedElement);
								
							}

						break;

						default:

							if (event.keyCode > 40 || event.keyCode === 8) {

								var inputPhrase = $field.val();

								if (!(config.get("list").hideOnEmptyPhrase === true && event.keyCode === 8 && inputPhrase === "")) {

									if (config.get("requestDelay") > 0) {
										if (requestDelayTimeoutId !== undefined) {
											clearTimeout(requestDelayTimeoutId);
										}

										requestDelayTimeoutId = setTimeout(function () { loadData(inputPhrase);}, config.get("requestDelay"));
									} else {
										loadData(inputPhrase);
									}

								} else {
									hideContainer();
								}
								
							}


						break;
					}
				

					function loadData(inputPhrase) {


						if (inputPhrase.length < config.get("minCharNumber")) {
							return;
						}


						if (config.get("data") !== "list-required") {

							var data = config.get("data");

							var listBuilders = listBuilderService.init(data);

							listBuilders = listBuilderService.updateCategories(listBuilders, data);
							
							listBuilders = listBuilderService.processData(listBuilders, inputPhrase);

							loadElements(listBuilders, inputPhrase);

							if ($field.parent().find("li").length > 0) {
								showContainer();	
							} else {
								hideContainer();
							}

						}

						var settings = createAjaxSettings();

						if (settings.url === undefined || settings.url === "") {
							settings.url = config.get("url");
						}

						if (settings.dataType === undefined || settings.dataType === "") {
							settings.dataType = config.get("dataType");
						}


						if (settings.url !== undefined && settings.url !== "list-required") {

							settings.url = settings.url(inputPhrase);

							settings.data = config.get("preparePostData")(settings.data, inputPhrase);

							$.ajax(settings) 
								.done(function(data) {

									var listBuilders = listBuilderService.init(data);

									listBuilders = listBuilderService.updateCategories(listBuilders, data);
									
									listBuilders = listBuilderService.convertXml(listBuilders);
									if (checkInputPhraseMatchResponse(inputPhrase, data)) {

										listBuilders = listBuilderService.processData(listBuilders, inputPhrase);

										loadElements(listBuilders, inputPhrase);	
																				
									}

									if (listBuilderService.checkIfDataExists(listBuilders) && $field.parent().find("li").length > 0) {
										showContainer();	
									} else {
										hideContainer();
									}

									config.get("ajaxCallback")();

								})
								.fail(function() {
									logger.warning("Fail to load response data");
								})
								.always(function() {

								});
						}

						

						function createAjaxSettings() {

							var settings = {},
								ajaxSettings = config.get("ajaxSettings") || {};

							for (var set in ajaxSettings) {
								settings[set] = ajaxSettings[set];
							}

							return settings;
						}

						function checkInputPhraseMatchResponse(inputPhrase, data) {

							if (config.get("matchResponseProperty") !== false) {
								if (typeof config.get("matchResponseProperty") === "string") {
									return (data[config.get("matchResponseProperty")] === inputPhrase);
								}

								if (typeof config.get("matchResponseProperty") === "function") {
									return (config.get("matchResponseProperty")(data) === inputPhrase);
								}

								return true;
							} else {
								return true;
							}

						}

					}


				});
			}

			function bindKeydown() {
				$field
					.on("keydown", function(evt) {
	        		    evt = evt || window.event;
	        		    var keyCode = evt.keyCode;
	        		    if (keyCode === 38) {
	        		        suppressKeypress = true; 
	        		        return false;
	        		    }
		        	})
					.keydown(function(event) {

						if (event.keyCode === 13 && selectedElement > -1) {

							$field.val(config.get("getValue")(elementsList[selectedElement]));

							config.get("list").onKeyEnterEvent();
							config.get("list").onChooseEvent();

							selectedElement = -1;
							hideContainer();

							event.preventDefault();
						}
					});
			}

			function bindKeypress() {
				$field
				.off("keypress");
			}

			function bindFocus() {
				$field.focus(function() {

					if ($field.val() !== "" && elementsList.length > 0) {
						
						selectedElement = -1;
						showContainer();	
					}
									
				});
			}

			function bindBlur() {
				$field.blur(function() {
					setTimeout(function() { 
						
						selectedElement = -1;
						hideContainer();
					}, 250);
				});
			}

			function removeAutocomplete() {
				$field.attr("autocomplete","off");
			}

		}

		function showContainer() {
			$container.trigger("show.eac");
		}

		function hideContainer() {
			$container.trigger("hide.eac");
		}

		function selectElement(index) {
			
			$container.trigger("selectElement.eac", index);
		}

		function loadElements(list, phrase) {
			$container.trigger("loadElements.eac", [list, phrase]);
		}

		function loseFieldFocus() {
			$field.trigger("blur");
		}


	};
	scope.eacHandles = [];

	scope.getHandle = function(id) {
		return scope.eacHandles[id];
	};

	scope.inputHasId = function(input) {

		if($(input).attr("id") !== undefined && $(input).attr("id").length > 0) {
			return true;
		} else {
			return false;
		}

	};

	scope.assignRandomId = function(input) {

		var fieldId = "";

		do {
			fieldId = "eac-" + Math.floor(Math.random() * 10000);		
		} while ($("#" + fieldId).length !== 0);
		
		elementId = scope.consts.getValue("CONTAINER_ID") + fieldId;

		$(input).attr("id", fieldId);
 
	};

	scope.setHandle = function(handle, id) {
		scope.eacHandles[id] = handle;
	};


	return scope;

})(EasyAutocomplete || {});

(function($) {

	$.fn.easyAutocomplete = function(options) {

		return this.each(function() {
			var $this = $(this),
				eacHandle = new EasyAutocomplete.main($this, options);

			if (!EasyAutocomplete.inputHasId($this)) {
				EasyAutocomplete.assignRandomId($this);
			}

			eacHandle.init();

			EasyAutocomplete.setHandle(eacHandle, $this.attr("id"));

		});
	};

	$.fn.getSelectedItemIndex = function() {

		var inputId = $(this).attr("id");

		if (inputId !== undefined) {
			return EasyAutocomplete.getHandle(inputId).getSelectedItemIndex();
		}

		return -1;
	};

	$.fn.getItems = function () {

		var inputId = $(this).attr("id");

		if (inputId !== undefined) {
			return EasyAutocomplete.getHandle(inputId).getItems();
		}

		return -1;
	};

	$.fn.getItemData = function(index) {

		var inputId = $(this).attr("id");

		if (inputId !== undefined && index > -1) {
			return EasyAutocomplete.getHandle(inputId).getItemData(index);
		}

		return -1;
	};

	$.fn.getSelectedItemData = function() {

		var inputId = $(this).attr("id");

		if (inputId !== undefined) {
			return EasyAutocomplete.getHandle(inputId).getSelectedItemData();
		}

		return -1;
	};

})(jQuery);

window.Mkt = window.Mkt || {};

var sgwHost = "";
var sgwAppId = "DE1FDF33D6278164A62EC486793F7CCF";

function initSgw(){
    try{
        if(typeof mktConfig !== "undefined" && mktConfig.sgwApi != "" && mktConfig.sgwApi != null ){
            sgwHost = mktConfig.sgwApi;
            return;
        }
    }catch(e){

    }
}
initSgw();



var countryCode = window.digitalData ? window.digitalData.page.pageInfo.countryCode : '';
var pageCategory = window.digitalData ? window.digitalData.page.category.pageType : '';

var DEFAULT_NAVI = "navi";
var DEFAULT_BANNER = "banner";
var DEFAULT_SERIES = "series";
var DEFAULT_RELATE = "relate";
var DEFAULT_PSP_COMPONENT = "psp-component";
var DEFAULT_PLP_SERIES = "plp-list";
var DEFAULT_PLP_MODEL_LIST = "plp-model";

const GA_THIRD_PARTY = {
    "navi" : {
        event: "naviPop",
        clickName: "header navi_click to pop_huawei",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "banner" : {
        event: "bannerPop",
        clickName: "banner click to pop_huawei_${name}",
        clickType: "action",
        bannerName: "${name}",
        bannerPosition: "${position}"
    },
    "products-display" : {
        event: "productsPop",
        clickType: "action",
        clickName: "banner click to pop_huawei_${name}",
        bannerName: "${name}",
        bannerPosition: "${position}",
    },
    "series-products-display" : {
        event: "seriesProductsPop",
        clickType: "action",
        clickName: "click to pop_huawei_${position}_series_section",
        pageCategory : pageCategory,
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "series" : {
        event: "seriesPop",
        clickName: "series_click to pop_huawei_${position}",
        clickType: "navigation",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "relate" : {
        event: "relateProductsPop",
        clickName: "product list_click to pop_huawei_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
        pageCategory : pageCategory
    },
    "psp-component" : {
        event: "productSelectPop",
        clickName: "product select_click to pop_huawei_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "plp-list" : {
        event: "seriesSectionPop",
        clickName: "click to pop_huawei_${position}_series_section",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
        pageCategory : pageCategory
    },
    "plp-model": {
        event: "recommendationSectionPop",
        clickName: "click to pop_huawei_${position}__recommendation_section",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
        pageCategory : pageCategory
    },
    "product-list" : {
        event: "listPop",
        clickName: "product list_click to pop_huawei_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "product-detail" : {
        event: "productPop",
        clickName: "product details_click to pop_huawei",
        clickType: "action",
        productMktName: "${name}"
    },
    "product-detail-footer" : {
        event: "productFooter",
        clickName: "product details_click to pop_footer",
        clickType: "action",
        productMktName: "${name}"
    },
    "search-product-detail-footer" : {
        event: "searchBuyToPopFooter",
        clickName: "site search click to pop footer",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "series-point" : {
        event: "relationSectionPop",
        clickName: "click to pop_huawei_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "series-recommend" : {
        event: "relateProductsPop",
        clickName: "product list_click to pop_huawei_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "site-search" : {
        event: "searchBuyToPopHuawei",
        clickName: "site search click to pop_huawei",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
    },
    "pdp-compare" : {
        event: "comparePop",
        clickType: "action",
        clickName: "product list_click to pop_huawei_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
    },
    "new-pdp-compare" : {
        // 第一
        event: "compareProductToPOP",
        clickType: "action",
        clickName: "click to pop_Huawei_PLP-Product_Comparison_Component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "PLP-Product_Comparison_Component_${name}",
        bannerPosition: "${position}",
    },
    "wearables-hero-banner" : {
        event: "bannerNamePop",
        clickType: "action",
        clickName: "click to pop_huawei_ wearables-hero-banner_${name}_${position}",
        bannerName: "wearables-hero-banner_${name}",
        bannerPosition: "${position}",
    },
    "wearables-product-card" : {
        event: "wearablesProductPop",
        clickType: "action",
        clickName: "click to pop_huawei_${name}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
    },
    "main-product" : {
        event: "mainProductToPOP",
        clickType: "action",
        clickName: "click to pop_Huawei_ plp-main-product-component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "plp-main-product-component_${name}",
        bannerPosition: "${position}"
    },
    "product-series-component":{
        event: "productSeriesComponentToPOP",
        clickType: "action",
        clickName: "click to pop_Huawei_ product-series-component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "product-series-component_${name}",
        bannerPosition: "${position}"
    },
    "more-products-component": {
        clickName: 'click to pop_Huawei_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentToPOP',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}'
    },
    "more-products-component-modal": {
        clickName: 'click to pop_Huawei_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentTipsToPOP',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}'
    }
};

const GA_PSP = {
    "navi" : {
        event: "productNavigationPspPosition",
        clickName: "navigation click to psp_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "banner" : {
        event: "bannerToPsp",
        clickName: "banner click to psp_${position}",
        clickType: "action",
        bannerName: "${name}",
        bannerPosition: "${position}"
    },
    "product-detail" : {
        event: "productChooseToPsp",
        clickName: "product details click to psp_${name}",
        clickType: "action",
        productMktName: "${name}"
    },
    "site-search" : {
        event: "searchBuyToPsp",
        clickName: "site search click to psp",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    }
};

const GA_OPEN_POPUP = {
    "navi" : {
        event: "naviIntent",
        clickName: "header navi_click to pop_intention",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "banner" : {
        event: "bannerIntent",
        clickType: "action",
        clickName: "banner click to pop_intention_${name}",
        bannerName: "${name}",
        bannerPosition: "${position}",
    },
    "products-display" : {
        event: "productsIntent",
        clickType: "action",
        clickName: "banner click to pop_intention_${name}",
        bannerName: "${name}",
        bannerPosition: "${position}",
    },
    "series-products-display" : {
        event: "seriesProductsIntent",
        clickType: "action",
        clickName: "click to pop_intention_${position}_series_section",
        pageCategory : pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
    },
    "series" : {
        event: "seriesIntent",
        clickName: "series_click to pop_intention_${position}",
        clickType: "navigation",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "relate" : {
        event: "relateProductsIntent",
        clickName: "product list_click to pop_intention_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
        pageCategory : pageCategory
    },
    "psp-component" : {
        event: "productSelectIntent",
        clickName: "product select_click to pop_intention_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "plp-list" : {
        event: "seriesSectionIntent",
        clickName: "click to pop_intention_${position}_series_section",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
        pageCategory : pageCategory
    },
    "plp-model" : {
        event: "recommendationSectionIntent",
        clickName: "click to pop_intention_${position}__recommendation_section",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
        pageCategory : pageCategory
    },
    "product-list" : {
        event: "listIntent",
        clickName: "product list_click to pop_intention_${position}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "product-detail" : {
        event: "productIntent",
        productMktName: "${name}",
        clickName: "product details_click to pop_intention",
        clickType: "action"
    },
    "series-point" : {
        event: "relationSectionIntent",
        clickName: "click to pop_intention_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "series-recommend" : {
       event: "relateProductsIntent",
       clickName: "product list_click to pop_intention_${position}",
       clickType: "action",
       pageCategory: pageCategory,
       productMktName: "${name}",
       productPosition: "${position}"
    },
    "site-search" : {
        event: "searchBuyToPopIntention",
        clickName: "site search click to pop_intention",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "pdp-compare" : {
        event: "compareIntent",
        clickType: "action",
        clickName: "product list_click to pop_intention_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
    },
    "new-pdp-compare" : {
        // 第二
        event: "compareProductToThirdPOP",
        clickType: "action",
        clickName: "click to pop_Huawei_PLP-Product_Comparison_Component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "PLP-Product_Comparison_Component_${name}",
        bannerPosition: "${position}",
    },
    "wearables-hero-banner" : {
        event: "bannerNameSelectIntent",
        clickType: "action",
        clickName: "click to pop intention_ wearables-hero-banner_${name}_${position}",
        bannerName: "wearables-hero-banner_${name}",
        bannerPosition: "${position}",
    },
    "wearables-product-card" : {
        event: "wearablesProductSelectIntent",
        clickType: "action",
        clickName: "click to pop intention_${name}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
    },
    "main-product" : {
        event: "mainProductToThirdPOP",
        clickType: "action",
        clickName: "click to pop_Huawei_ plp-main-product-component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "plp-main-product-component_${name}",
        bannerPosition: "${position}"
    },
    "product-series-component":{
        event: "productSeriesComponentToIntentionPOP",
        clickType: "action",
        clickName: "click to pop intention_ product-series-component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "product-series-component_${name}",
        bannerPosition: "${position}"
    },
    "more-products-component": {
        clickName: 'click to pop intention_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentToIntentionPOP',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}'
    },
    "more-products-component-modal": {
        clickName: 'click to pop intention_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentTipsToIntentionPOP',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}'
    }
};

const GA_PDP = {
    "navi" : {
        event: "naviPdp",
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "header navi_click to pdp",
        clickType: "navigation"
    },
    "banner" : {
        event: "bannerPdp",
        bannerName: "${name}",
        bannerPosition: "${position}",
        clickName: "banner_click to pdp_${name}",
        clickType: "navigation"
    },
    "series" : {
        event: "seriesPdp",
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "series_click to pdp_${position}",
        clickType: "navigation"
    },
    "psp-component" : {
        event: "productSelectClick",
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "product select_click to pdp_${position}",
        clickType: "action",
        pageCategory: pageCategory
    },
    "plp-list" : {
        event: "seriesSectionClick",
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "click to pdp_${position}_series_section",
        clickType: "action",
        pageCategory: pageCategory
    },
    "plp-model" : {
        event: "recommendationSectionLink",
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "click to pdp_${position}__recommendation_section",
        clickType: "action",
        pageCategory: pageCategory
    },
    "product-list" : {
        event: "listPdp",
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "product list_click to pdp_${position}",
        clickType: "action"
    },
    "series-product-list" : {
        event: "seriesProductsClick",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        clickName: "click to pdp_${name}_series_section",
        clickType: "action"
    },
    "series-point" : {
        event: "relationSectionClick",
        clickName: pageCategory + "_click to " + "series_related_points_${name}_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        bannerName: "series_related_points_${name}",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "series-recommend" : {
        event: "relationSectionClick",
        clickName:  pageCategory + "_click to ${name}_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        bannerName: "series_recommend_banner_${name}",
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "site-search" : {
        event: "relationSectionClick",
        clickName:  pageCategory + "_click to ${name}_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}"
    },
    "wearables-hero-banner" : {
        event: "bannerNameClick",
        clickType: "action",
        clickName: "click to pdp_ wearables-hero-banner_${name}_${position}",
        bannerName: "wearables-hero-banner_${name}",
        bannerPosition: "${position}",
    },
    "wearables-product-card" : {
        event: "wearablesProductClick",
        clickType: "action",
        clickName: "click to pdp_recommendation_section ${name}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
    }
};

const GA_PARTNER = {
    "navi" : {
        event: "naviPlatform",
        productMktName: "${name}",
        productPosition: "top",
        ecPlatform: "${ecPlatform}",
        clickName: "header navi_click to pop_${ecPlatform}",
        clickType: "exit"
    },
    "banner" : {
        event: "bannerPlatform",
        bannerName: "${name}",
        bannerPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "banner click to pop_${ecPlatform}_${name}",
        clickType: "action"
    },
    "products-display" : {
        event: "bannerPlatform",
        bannerName: "${name}",
        bannerPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "banner click to pop_${ecPlatform}_${name}",
        clickType: "action"
    },
    "series-products-display" : {
        event: "seriesSectionPlatform",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "click to pop_${ecPlatform}_${position}_series_section",
        clickType: "exit"
    },
    "series" : {
        event: "SeriesProductPlatform",
        productMktName: "${name}",
        ecPlatform: "${ecPlatform}",
        clickName: "series_click to pop_${ecPlatform}_${position}",
        clickType: "exit"
    },
    "relate" : {
        event: "relateProductsPlatform",
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "product list_click to pop_${ecPlatform}_${position}",
        clickType: "exit",
        pageCategory: pageCategory
    },
    "psp-component" : {
        event: "productSelectPlatform",
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "product select_click to pop_${ecPlatform}_${position}",
        clickType: "exit"
    },
    "plp-list" : {
        event: "seriesSectionPlatform",
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "click to pop_${ecPlatform}_${position}_series_section",
        clickType: "exit",
        pageCategory: pageCategory
    },
    "plp-model" : {
        event: "recommendationSectionPlatform",
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "click to pop_${ecPlatform}_${position}__recommendation_section",
        clickType: "exit",
        pageCategory: pageCategory
    },
    "product-list" : {
        event: "listPlatform",
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}",
        clickName: "product list_click to pop_${ecPlatform}_${position}",
        clickType: "exit"
    },
    "product-detail" : {
        event: "productPlatform",
        productMktName: "${name}",
        ecPlatform: "${ecPlatform}",
        clickName: "product list_click to pop_${ecPlatform}",
        clickType: "exit"
    },
    "series-point" : {
         event: "relationSectionPlatform",
         clickName: "click to pop_${ecPlatform}_${position}",
         clickType: "exit",
         pageCategory: pageCategory,
         productMktName: "${name}",
         productPosition: "${position}",
         ecPlatform: "${ecPlatform}"
    },
    "series-recommend" : {
       event: "relateProductsPlatform",
       clickName: "product list_click to pop_${ecPlatform}_${position}",
       clickType: "exit",
       pageCategory: pageCategory,
       productMktName: "${name}",
       productPosition: "${position}",
       ecPlatform: "${ecPlatform}"
    },
    "site-search" : {
        event: "searchBuyToPopEcPlatform",
        clickName: "site search click to pop_${ecPlatform}",
        clickType: "exit",
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}"
    },
    "pdp-compare" : {
        event: "ComparePlatform",
        clickType: "exit",
        clickName: "product list_click to pop_${ecPlatform}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}"
    },
    "new-pdp-compare" : {
        // 第三
        event: "compareProductToecPlatformPOP",
        clickType: "action",
        clickName: "click to pop_${ecPlatform}_PLP-Product_Comparison_Component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "PLP-Product_Comparison_Component_${name}",
        bannerPosition: "${position}",
        ecPlatform: "${ecPlatform}"
    },
    "wearables-hero-banner" : {
        event: "bannerNameSelectPlatform",
        clickType: "exit",
        clickName: "click to pop_${ecPlatform}_wearables-hero-banner_${name}_${position}",
        bannerName: "wearables-hero-banner_${name}",
        bannerPosition: "${position}",
        ecPlatform: "${ecPlatform}"
    },
    "wearables-product-card" : {
        event: "wearablesProductSelectPlatform",
        clickType: "exit",
        clickName: "click to pop_${ecPlatform}_series_section ${name}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        ecPlatform: "${ecPlatform}"
    },
    "main-product" : {
        event: "mainProductToThirdecPlatformPOP",
        clickType: "action",
        clickName: "click to pop_${ecPlatform}_ plp-main-product-component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "plp-main-product-component_${name}",
        bannerPosition: "${position}",
        ecPlatform: "${ecPlatform}"
    },
    "product-series-component":{
         event: "productSeriesComponentToecPlatformPOP",
         clickType: "action",
         clickName: "click to pop_${ecPlatform}_ product-series-component_${name}_${position}",
         pageCategory: pageCategory,
         bannerName: "product-series-component_${name}",
         bannerPosition: "${position}",
         ecPlatform: "${ecPlatform}"
    },
    "more-products-component": {
        clickName: 'click to pop_${ecPlatform}_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentToecPlatformPOP',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}',
        ecPlatform: '${ecPlatform}'
    },
    "more-products-component-modal": {
        clickName: 'click to pop_${ecPlatform}_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentTipsToecPlatformPOP',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}',
        ecPlatform: '${ecPlatform}'
    }
};

const GA_GLOBAL = {
    "navi" : {
        event: "naviEN",
        productMktName: "${name}",
        productPosition: "top",
        countryCode: "${countryCode}",
        clickName: "header navi_click to pop_${countryCode}",
        clickType: "action"
    },
    "banner" : {
        event: "bannerEN",
        bannerName: "${name}",
        bannerPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "banner click to pop_${countryCode}_${name}",
        clickType: "action"
    },
    "products-display" : {
        event: "bannerEN",
        bannerName: "${name}",
        bannerPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "banner click to pop_${countryCode}_${name}",
        clickType: "action"
    },
    "series-products-display" : {
        event: "seriesSectionEN",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "click to pop_${countryCode}_${position}_series_section",
        clickType: "action"
    },
    "series" : {
        event: "seriesEN",
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "series_click to pop_${countryCode}_${position}",
        clickType: "navigation"
    },
    "relate" : {
        event: "relateProductsEN",
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "product list_click to pop_${countryCode}_${position}",
        clickType: "action",
        pageCategory: pageCategory
    },
    "psp-component" : {
        event: "productSelectEN",
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "product select_click to pop_${countryCode}_${position}",
        clickType: "action"
    },
    "plp-list" : {
        event: "seriesSectionEN",
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "click to pop_${countryCode}_${position}_series_section",
        clickType: "action",
        pageCategory: pageCategory
    },
    "plp-model" : {
        event: "recommendationSectionEN",
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "click to pop_${countryCode}_${position}__recommendation_section",
        clickType: "action",
        pageCategory: pageCategory
    },
    "product-list" : {
        event: "listEn",
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}",
        clickName: "product list_click to pop_${countryCode}_${position}",
        clickType: "action"
    },
    "product-detail" : {
        event: "productEN",
        productMktName: "${name}",
        countryCode: "${countryCode}",
        clickName: "product details_click to pop_${countryCode}",
        clickType: "action"
    },
    "series-point" : {
        event: "relationSectionEN",
        clickName: "click to pop_${countryCode}_${position}",
        clickType: "action",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}"
    },
    "series-recommend" : {
       event: "relateProductsEN",
       clickName: "product list_click to pop_${countryCode}_${position}",
       clickType: "action",
       pageCategory: pageCategory,
       productMktName: "${name}",
       productPosition: "${position}",
       countryCode: "${countryCode}"
    },
    "site-search" : {
        event: "searchBuyToCountryCode",
        clickName: "site search click to pop_${countryCode}",
        clickType: "action",
        productMktName: "${name}",
        productPosition: "${position}",
       countryCode: "${countryCode}"
    },
    "pdp-compare" : {
        event: "compareProductsEn",
        clickType: "action",
        clickName: "product list_click to pop_${countryCode}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}"
    },
    "new-pdp-compare" : {
        // 第四
        event: "compareProductToCountryCode",
        clickType: "action",
        clickName: "click to pop_${countryCode}_PLP-Product_Comparison_Component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "PLP-Product_Comparison_Component_${name}",
        bannerPosition: "${position}",
        countryCode: "${countryCode}"    
    },
    "wearables-hero-banner" : {
        event: "bannerNameSelectEN",
        clickType: "action",
        clickName: "click to pop_${countryCode}_wearables-hero-banner_${name}_${position}",
        bannerName: "wearables-hero-banner_${name}",
        bannerPosition: "${position}",
        countryCode: "${countryCode}"
    },
    "wearables-product-card" : {
        event: "wearablesProductSelectEN",
        clickType: "action",
        clickName: "click to pop_${countryCode}_series_section ${name}_${position}",
        pageCategory: pageCategory,
        productMktName: "${name}",
        productPosition: "${position}",
        countryCode: "${countryCode}"
    },
    "main-product" : {
        event: "mainProductToCountryCode",
        clickType: "action",
        clickName: "click to pop_${countryCode}_ plp-main-product-component_${name}_${position}",
        pageCategory: pageCategory,
        bannerName: "plp-main-product-component_${name}",
        bannerPosition: "${position}",
        countryCode: "${countryCode}"
    },
    "product-series-component":{
         event: "productSeriesComponentToCountryCode",
         clickType: "action",
         clickName: "click to pop_${countryCode}_ product-series-component_${name}_${position}",
         pageCategory: pageCategory,
         bannerName: "product-series-component_${name}",
         bannerPosition: "${position}",
         countryCode: "${countryCode}"
    },
    "more-products-component": {
        clickName: 'click to pop_${countryCode}_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentToCountryCode',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}',
        countryCode: '${countryCode}'
    },
    "more-products-component-modal": {
        clickName: 'click to pop_${countryCode}_more-products-component_${name}_${position}',
        clickType: 'action',
        event: 'moreProductsComponentTipsToCountryCode',
        pageCategory: pageCategory,
        bannerName: 'more-products-component_${name}',
        bannerPosition: '${position}',
        countryCode: '${countryCode}'
    }
};

function fillGAData(obj, name, position, ecPlatform, countryCode){
    var matchs = arguments.callee.toString().match(/\s*function[\w\s]*\(([\w\s,]*)\)/);
    var argArray = matchs[1].split(",");
    const args = [name, position, ecPlatform, countryCode];
    var objStr = JSON.stringify(obj);
    for(var i=1 ; i<argArray.length ; i++){
        let arg = argArray[i].trim();
        let argValue = args[i-1];
        if (argValue !== undefined && argValue !== null && argValue !== "") {
            objStr = objStr.replace(
                new RegExp("\\${" + arg + "}", "gm"),
                argValue.toString().replace(/"/g, "\\\"")
            );
        }
    }

    return JSON.parse(objStr);
}

var buyToThirdParty_gtm = function (name, position, eventtype, thsBtn, isToPsp) {
	isToPsp = isToPsp || false;
    var gaData = isToPsp ? GA_PSP[eventtype] : GA_THIRD_PARTY[eventtype];
    if(gaData != null){
        gaData = fillGAData(gaData, name, position);
        window.dataLayer.push(gaData);
    }

    if (eventtype.indexOf(DEFAULT_NAVI) != -1) {
        dmpaCommon("trackEvent", "click", "navigation interaction", name, thsBtn.attr("data-btnlinkinfo"));
    } else if (eventtype.indexOf(DEFAULT_BANNER) != -1) {
        dmpaCommon("trackEvent", "click", "banner interaction", name, thsBtn.attr("data-btnlinkinfo"));
    }
};

var buyOpenPopup_gtm = function (name, position, eventtype) {
    var layerData = GA_OPEN_POPUP[eventtype];
    if(layerData != null){
        layerData = fillGAData(layerData, name, position);
        window.dataLayer.push(layerData);
    }

    if (eventtype.indexOf(DEFAULT_NAVI) != -1) {
        dmpaCommon("trackEvent", "click", "navigation interaction", name, "");
    } else if (eventtype.indexOf(DEFAULT_BANNER) != -1) {
        dmpaCommon("trackEvent", "click", "banner interaction", name, "");
    }
};

var buyToPdp_gtm = function (name, position, eventtype) {
    var layerData = GA_PDP[eventtype];
    if(layerData != null){
        layerData = fillGAData(layerData, name, position);
        window.dataLayer.push(layerData);
    }
};

var buyPartner_gtm = function (name, position, ecPlatform, eventtype){
    var layerData = GA_PARTNER[eventtype];
    if(layerData != null){
        layerData = fillGAData(layerData, name, position, ecPlatform);
        window.dataLayer.push(layerData);
    }
};

var buyGlobal_gtm = function(name, position, countryCode, eventtype){
    var layerData = GA_GLOBAL[eventtype];
    if(layerData != null){
        layerData = fillGAData(layerData, name, position, null, countryCode);
        window.dataLayer.push(layerData);
    }
};

function GATool() {
    // Header Navigation
    $("[data-navicon]").on("click", function () {
        // 是否含有弹窗，默认 false
        var hasPopup = $(this).attr('aria-haspopup') || 'false';
        // 弹窗是否已展开，默认 false
        var isExpanded = $(this).attr('aria-expanded') || 'false';
        // GA统计的弹窗状态
        var popupStatusForGA = '';
        if(hasPopup==='true'){
            popupStatusForGA =  (isExpanded==='true') ? 'close' : 'open';
        }
        // 弹窗关闭时不统计GA
        if(popupStatusForGA==='close') return;

        try {
            if ($(this).parent() && !$(this).parent().hasClass("third-party-jump") && $(this).data("navicon") == "to Vmall") {
                //shop 配置在登录按钮里面
                window.dataLayer.push({
                    clickName: "account_click cart",
                    clickType: "action",
                    event: "accountInteraction",
                    accountInteraction: "cart",
                    accountType: ""
                });
            } else {
                //通常情况
                var obj = {
                    event: "firstNavi",
                    iconName: $(this).attr("data-navicon"),
                    clickName: "first navi_click " + $(this).attr("data-navicon"),
                    clickType: "navigation"
                }
                window.dataLayer.push(obj);
                dmpaCommon("trackEvent", "click", "navigation interaction", "firstNavigation", $(this).attr("data-navicon"));
            }
        } catch (e) {

        }

    });

    // Header second navigation bar (left column)
    $("[data-navsecondlink]").on("click", function () {
        var obj = {
            event: "secondNavi",
            productMktName: $(this).attr("data-navsecondlink"),
            productPosition: $(this).attr("data-position"),
            iconName: $(this).attr("data-navsecondlink"),
            clickName: "second navi_click " + $(this).attr("data-navsecondlink"),
            clickType: "navigation"
        }
        window.dataLayer.push(obj);
        dmpaCommon("trackEvent", "click", "navigation interaction", $(this).attr("data-navsecondlink"), $(this).attr('href'))
    });

    //Mobile Service Header Navigation
    $("[data-mobileservice]").on("click", function () {
        var obj = {
            event: "naviService",
            serviceMktName: $(this).attr("data-mobileservice"),
            servicePosition: $(this).attr("data-position"),
            clickName: "header navi_click to mobileservices",
            clickType: "navigation"
        }
        window.dataLayer.push(obj);
        dmpaCommon("trackEvent", "click", "navigation interaction", $(this).attr("data-mobileservice"), $(this).attr('href'))
    });

    // Header second navigation card to pdp
    $("[data-navcardlink]").on("click", function () {
        window.dataLayer.push({
            event: "naviPdp",
            productMktName: $(this).attr("data-navcardlink"),
            productPosition: $(this).attr("data-position"),
            clickName: "header navi_click to pdp",
            clickType: "navigation"
        })
        dmpaCommon("trackEvent", "click","navigation interaction", $(this).attr("data-navcardlink"), $(this).attr('href'));
    });

    //Navigation support
    $("[data-navsupportcard]").on("click", function () {
        window.dataLayer.push({
            clickName: "header navi_click to product support",
            clickType: "navigation",
            event: "naviSupport",
            productMktName: $(this).attr("data-navsupportcard"),
            productPosition: $(this).attr("data-position")
        });
        dmpaCommon("trackEvent", "click", "navigation interaction", $(this).attr("data-navsupportcard"), $(this).attr('href'));
    });

    // Footer Social Link
    $("[data-social]").on("click", function () {
        window.dataLayer.push({
            clickName: "social_click " + $(this).attr("data-social"),
            clickType: "action",
            event: "social",
            socialMedia: $(this).attr("data-social")
        });
    });

    // Footer Call Us - Phone Number
    $(document).on("click", "[data-clicktocall]", function () {
        window.dataLayer.push({
            event: "clickToCall",
            buttonPosition: $(this).attr("data-clicktocall")
        });
    });

    //Banner Button except Buy Button
    $("[data-bannerevent]").on("click", function (event) {
        var type = $(this).attr("data-btntype");
        var name = $(this).attr("data-bannerevent");
        var url = $(this).attr("href") || '';
        var urlNameArr = url.split('/');
        var bannerName = ""
        var label = name + "_" + $(this).attr("title");
        if (name == 'hero_carousel') {
            bannerName = name + '_' + $('.hero-carousel__slider').find('.swiper-slide-active').attr('data-slidename');
        } else {
            var productName = url.endsWith("/") && urlNameArr.length > 2
                ? urlNameArr[urlNameArr.length - 2] : urlNameArr[urlNameArr.length - 1];
            bannerName = name + '_' + productName;
        }

        var obj = {};

        /*sub banner组件埋码*/
        if(name=='sub_banner'){
            // campaign页面
            if (url.indexOf('?toCampaign') != -1) {
                obj = {
                    event: "bannerCampaign",
                    bannerName: "sub_banner_" + $(this).parent().siblings(".sub-banner__title").find("a").attr("title"),
                    bannerPosition: $(this).attr("data-position")
                }
                window.dataLayer.push(obj);
            } else {
                // pdp页面
                obj = {
                    event: "bannerPdp",
                    bannerName: "sub_banner_" + $(this).parent().siblings(".sub-banner__title").find("a").attr("title"),
                    bannerPosition: $(this).attr("data-position")
                }
                window.dataLayer.push(obj);
            }
            var componentName ='h13-sub-banner'+"_"+$(this).parents('.sub-banne').find('.sub-banner__img a').attr('title');
            dmpaCommon("trackEvent", "click", "banner interaction", componentName, url);
        }else{
            if (!url.endsWith("/")) {
                url = url + "/";
            }
            if (type == 'campaignBtn' || url.indexOf('/campaign/') != -1 || url.indexOf('?toCampaign') != -1) {
                obj = {
                    event: "bannerCampaign",
                    bannerName: bannerName,
                    bannerPosition: $(this).attr("data-position"),
                    clickName: "banner click to campaign_" + bannerName,
                    clickType: "navigation"
                }
            } else if (url.indexOf('/offer/') != -1) {
                obj = {
                    event: "bannerOffer",
                    bannerName: bannerName,
                    bannerPosition: $(this).attr("data-position"),
                    clickName: 'banner click to offer_' + bannerName,
                    clickType: "navigation"
                }
            } else {
                obj = {
                    event: "bannerPdp",
                    bannerName: bannerName,
                    bannerPosition: $(this).attr("data-position"),
                    clickName: "banner click to pdp_" + bannerName,
                    clickType: "navigation"
                }
            }
            window.dataLayer.push(obj);
            dmpaCommon("trackEvent", "click", "banner interaction", label, url);
        }
        event.stopPropagation();
    });

    // sub-banner埋码
    $(".sub-banner__item-wrap").on("click", function (event) {
        if (event.target.className.indexOf('global-buy-button') != -1) {
            event.preventDefault();
            return;
        }
        var url = $(this).find("[data-bannerevent]").attr("href");
        var bannerPosition = $(this).find("[data-bannerevent]").attr("data-position");

        var obj;
        if(url != null && url.indexOf("?toCampaign")>-1){
            // campaign页面
            obj = {
                event: "bannerCampaign",
                bannerName: "sub_banner_" + $(this).find(".sub-banner__title a").attr("title"),
                bannerPosition: bannerPosition
            }

        }else{
			// pdp页面
            obj = {
                event: "bannerPdp",
                bannerName: "sub_banner_" + $(this).find(".sub-banner__title a").attr("title"),
                bannerPosition: bannerPosition
            }
        }
        window.dataLayer.push(obj);
        event.stopPropagation();
    });

    $("[data-bannerbackimgevent]").on("click", function (event) {
        if (event.target.className.indexOf('global-buy-button') != -1) {
            event.preventDefault();
        } else {
            var type = $(this).attr("data-btntype");
            var name = $(this).attr("data-bannerbackimgevent");
            var url = $(this).attr("href");
            var bannerName = ""
            if (url) {
                var urlNameArr = url.split('/')

                if (name == "hero_carousel") {
                    bannerName = name + '_' + $('.hero-carousel__slider').find('.swiper-slide-active').attr('data-slidename');
                } else {
                    bannerName = name + '_' + urlNameArr[urlNameArr.length - 1]
                }
                if (type == 'campaignBtn' || (url != null && url.indexOf('/campaign/') != -1) || (url != null && url.indexOf('?toCampaign') != -1)) {
                    var obj = {
                        event: "bannerCampaign",
                        bannerName: bannerName,
                        bannerPosition: $(this).attr("data-position"),
                        clickName: "banner click to campaign_" + bannerName,
                        clickType: "navigation"
                    }
                    window.dataLayer.push(obj);
                } else {
                    window.dataLayer.push({
                        event: "bannerPdp",
                        bannerName: bannerName,
                        bannerPosition: $(this).attr("data-position"),
                        clickName: "banner click to pdp_" + bannerName,
                        clickType: "navigation"
                    })
                }
            }

        }
    });


    $(".country-selection__country-wrap").on("click", function () {
        var originCountryCode = sessionStorage.getItem("origin_site_path") ? sessionStorage.getItem("origin_site_path") : "";
        var obj = {
            "event": "csCountry",
            "clickedCountryCode": $(this).attr("data-selectsitecode"),
            "clickName": "country switch_from " + originCountryCode + " to " + $(this).attr("data-selectsitecode"),
            "clickType": "navigation",
            "originCountryCode": originCountryCode
        };

        window.dataLayer.push(obj);
        dmpaCommon("trackEvent","click","country selection",$(this).attr("data-selectsitecode"),$(this).attr("href"));
    });

    $('[data-bgname]').on("click", function () {
        var obj = {
            event: "bgSwitch",
            bgName: $(this).attr("data-bgname"),
            clickName: "switch bg to" + $(this).attr("data-bgname"),
            clickType: "exit"
        }
        window.dataLayer.push(obj);
        dmpaCommon("trackEvent", "click", "navigation interaction", $(this).attr("data-bgname"), $(this).attr('href'));
    });

    $('.signInBtn').on("click", function () {
        window.dataLayer.push({
            event: "accountInteraction",
            accountInteraction: "log in",
            accountType: ""
        });
        dmpaCommon("trackEvent", "click", "accout", "log in", "");
    });

    $('.registeredBtn').on("click", function () {
        window.dataLayer.push({
            event: "accountInteraction",
            accountInteraction: "creation",
            accountType: ""
        });
        dmpaCommon("trackEvent", "click", "accout", "creation", "");
    });

    $('.aboutUsNavi').on("click", function () {
        var linkName = $(this).attr("href");
        if (linkName.indexOf("news") > -1) {
            linkName = "news";
        } else {
            linkName = "career";
        }

        window.dataLayer.push({
            clickName: "click to " + linkName,
            clickType: "navigation",
            event: "aboutUsNavi",
            linkName: linkName
        })
    });

    $('.signin-service').on("click", function () {
        window.dataLayer.push({
            clickName: "account_click my service",
            clickType: "action",
            event: "accountInteraction",
            accountInteraction: "my service",
            accountType: ""
        });
        dmpaCommon("trackEvent", "click", "accout", "my service", "");
    });

    $('.signin-information').on("click", function () {
        window.dataLayer.push({
            clickName: "account_click my info",
            clickType: "action",
            event: "accountInteraction",
            accountInteraction: "my info",
            accountType: ""
        });
        dmpaCommon("trackEvent", "click", "accout", "my info", "");
    });


    $('.logout-btn').on("click", function () {
        window.dataLayer.push({
            clickName: "account_click my log out",
            clickType: "action",
            event: "accountInteraction",
            accountInteraction: "log out",
            accountType: ""
        });
        dmpaCommon("trackEvent", "click", "accout", "log out", "");
    });

    //homepage Service Banner Link
    $('.s02-service-banner .service-banner__link').on("click", function () {
        var linkName = $(this).siblings(".service-banner__title").attr("data-title");
        window.dataLayer.push({
            clickName: "service_click to " + linkName,
            clickType: "navigation",
            event: "serviceClick",
            serviceLink: linkName
        })
    });

    //二级导航
    $('.product-tabs__link').on("click",function () {
        if (!(window.location.href.indexOf("/support") > 0)) {
            var productMktName = $('#second-navigation-v4 .product-link__active').attr("data-title") || "";
            var buttonName = $(this).attr("data-title");
            var $subheaderSection;
            // 页面参数
            var $pagetype = window.digitalData.page.category;
            // 当前按钮的位置
            if(window.location.href.indexOf("/news/")>-1 ||
                window.location.href.indexOf("/video/")>-1) {
                // 新闻详情页、视频页
                $subheaderSection = $pagetype.subCategory1 +" " + "page";
            }else if(window.location.href.indexOf("/campaign/")>-1){
                // campaign页
                $subheaderSection = $pagetype.primaryCategory +" " + "page";
            }else{
                // 产品详情页
                $pagetype.pageType=="product-detail"? $subheaderSection = "product details page":$subheaderSection = $pagetype.pageType +" " + "page";
            }

    	    var ga = {
                 clickName : "sub header_click to " + buttonName,
                 clickType : "navigation",
                 event: "subHeaderNavigationInteraction",
                 subheaderSection: $subheaderSection,
                 productMktName: productMktName,
                 buttonName: buttonName
           }
            window.dataLayer.push(ga);
            dmpaCommon("trackEvent", "click", "sub header navigation interaction", $subheaderSection,buttonName);
        }
    });

    /*============ 购买弹窗中的GA统计 开始 ============*/
    // naviEN bannerEN listEn productEN
    $(document).on('click', '[data-selectedglobalbuy]', function () {
        var name = $(this).attr("data-nameforga");
        var selectCountryCode = $(this).attr("data-selectedglobalbuy");
        var eventtype = $(this).attr("data-eventtype");
        var bannerPosition = $(this).attr("data-bannerposition");
        buyGlobal_gtm(name, bannerPosition, selectCountryCode, eventtype);

        if (eventtype.indexOf(DEFAULT_NAVI) != -1) {
            dmpaCommon("trackEvent", "click", "navigation interaction", name, selectCountryCode);
        } else if (eventtype.indexOf(DEFAULT_BANNER) != -1) {
            dmpaCommon("trackEvent", "click", "banner interaction", name, selectCountryCode);
        } else {
            var pageType = window.digitalData ? window.digitalData.page.category.pageType : '';
            var dmpaCategory = (pageType == "product-listing") ?"product list interaction":"product details interaction";
            dmpaCommon("trackEvent", "click", dmpaCategory, getChapter2(), selectCountryCode);
        }
    });

    $(document).on('click', '[data-selectedpartnerbuy]', function () {
        var ecPlatform = $(this).attr("data-selectedpartnerbuy");
        var name = $(this).attr("data-nameforga");
        var eventtype = $(this).attr("data-eventtype");
        var bannerPosition = $(this).attr("data-bannerposition");
        buyPartner_gtm(name, bannerPosition, ecPlatform, eventtype);

        if (eventtype.indexOf(DEFAULT_NAVI) != -1) {
            dmpaCommon("trackEvent", "click", "navigation interaction", name, ecPlatform);
        } else if (eventtype.indexOf(DEFAULT_BANNER) != -1) {
            dmpaCommon("trackEvent", "click", "banner interaction", name, ecPlatform);
        } else {
            var pageType = window.digitalData ? window.digitalData.page.category.pageType : '';
            var dmpaCategory = (pageType == "product-listing") ?"product list interaction":"product details interaction";
            dmpaCommon("trackEvent", "click",dmpaCategory, getChapter2(), ecPlatform);
        }
    });
    /*============ 购买弹窗中的GA统计 结束 ============*/

    $('.nav-tolink').attr('href', function () {
        var siteCountryCode = window.digitalData ? window.digitalData.page.pageInfo.siteCode2 : '';
        var linkHref = $(this).attr('href') || '';
        var tolink = linkHref + (linkHref.indexOf('?') == -1 ? '?' : '&') + 'fromConsumer=' + siteCountryCode + '_' + pageCategory + '_' + $(this).text();
        return tolink
    })
    // plp购买按钮dmpa
    $('.product_buy_btn').on('click',function(){
        dmpaCommon("trackEvent","click","product list interaction",getPageName(),$(this).attr("data-btnlinkinfo"));
    })
    //一级导航跳第三方链接
    $('.nav-tolink').on("click", function () {
        var name = $(this).attr("title");
        dmpaCommon("trackEvent", "click", "navigation interaction", name, $(this).attr('href'));
    });

    //Series page
    $("[data-series-pdp]").on("click", function () {
        window.dataLayer.push({
            event: "seriesPdp",
            productMktName: $(this).attr("data-nameforga"),
            productPosition: $(this).attr("data-position"),
            clickName: "series_click to pdp_" + $(this).attr("data-position"),
            clickType: "navigation"
        });
    });

    //Relate Products
    $("[data-relate-pdp]").on("click", function () {
        window.dataLayer.push({
            event: "relateProductsPdp",
            productMktName: $(this).attr("data-nameforga"),
            productPosition: $(this).attr("data-position"),
            clickName: "product list_click to pdp_" + $(this).attr("data-position"),
            clickType: "action",
            pageCategory: pageCategory
        });
    });

    //footer nav
    $(".footer-links__list .footer-links__item").on("click", function () {
        window.dataLayer.push({
            "event": "footerNavi",
            "iconName": $(this).find("a").data("title"),
            "clickName" : "foot_click " + $(this).find("a").data("title"),
            "clickType" : "action"
        });
    });

    //downlaod (app gallery apk & privacy white paper)
    $(".btn.erweimaBTN.a-interaction.a-common").on("click", function () {
        window.dataLayer.push({
            "clickName": "appgallery_click download",
            "clickType": "download",
            "event": "download",
            "buttonName": "appgallery apk",
            "pageName": window.digitalData.page.category.pageType,
            "buttonPosition": "top"
        })
    });


    $(".wrap.text-link__wrap .text-link__download").on("click", function () {
        try {
            var buttonName = $(this).text().trim();
            window.dataLayer.push({
                "clickName": buttonName + "_click download",
                "clickType": "download",
                "event": "download",
                "buttonName": buttonName,
                "pageName": window.digitalData.page.category.pageType,
                "buttonPosition": "bottom"
            })
        } catch (e) {

        }
    });


    //white paper
    $(".sec .download .pdf").on("click", function () {
        try {
            window.dataLayer.push({
            	"clickName": $(this).text().trim() + "_click download",
                "clickType": "download",
                "event": "download",
                "buttonName": $(this).text().trim(),
                "pageName": window.digitalData.page.category.pageType,
                "buttonPosition": "bottom"
            })
        } catch (e) {

        }
    });


    //weu product buy
    $(".productconfigurator").on("click", ".weu-btn.weu-btn--primary.js-weu-productconfigurator__buy-btn", function () {
        try {
            // 产品名字
            var $productMktName = $(this).attr("lab").trim();
            var ga = {
                "clickName": "product details_click to pop_intention",
                "clickType": "action",
                "event": "productIntent",
                "productMktName": $productMktName
            };
            window.dataLayer.push(ga);
            //dmpa埋码409
            var $productCategory = getPageName(),//当前页面
                $pageUrl = CBG_SITE_ROOT.substring(0,CBG_SITE_ROOT.length-1) + '' + window.location.pathname,//绝对路径
                $partialPath = currentPageName.split(':').length == 2 ? 'homepage' : window.location.pathname.split(siteCode)[1];
            var eData = {
                category: 'product list interaction',
                label: $productCategory,
                value: $productMktName,
                location: $pageUrl,
                uri: $partialPath ,
                subModuleName: 'Marketing'
            }
            if(typeof dmpa5 !== 'undefined'){
                dmpa5('trackEvent', 'click', eData);
            }
            dmpaCommon("trackEvent", "click",'product list interaction', getChapter2(), $(this).attr('href'));
            //dmpa埋码409
        } catch (e) {

        }
    })

    // track order act="header_navigation" lab="track_order"
    $("[act='header_navigation'][lab='track_order']").on("click", function () {
        try {
            window.dataLayer.push({

                "clickName": "account_click track order",
                "clickType": "action",
                "event": "accountInteraction",
                "accountInteraction": "track order",
                "accountType": ""
            })
        } catch (e) {

        }
    });

    // language switch
    $(".site_choose_mask .mask_content .site_choose_btn").on("click", function () {
        try {
            var buttonName = $(this).data("language");
            window.dataLayer.push({
                "clickName": "language pop up_click " + buttonName,
                "clickType": "action",
                "event": "languageSelection",
                "buttonName": buttonName
            })
        } catch (e) {

        }
    });


    $(".site_choose_mask .mask_content #close_btn").on("click", function () {
        try {
            window.dataLayer.push({
                "clickName": "language pop up_click close",
                "clickType": "action",
                "event": "languageSelection",
                "buttonName": "close"
            })
        } catch (e) {

        }
    });
}

//DMPA
function dmpaCommon(dmpaType, dmpaEvent, category, label, value) {
    var location = window.location.href;//绝对路径
    var uri = window.digitalData.page.category.pageType === 'homepage' ? 'homepage' : window.location.pathname.split(siteCode)[1];
    var eData = {
        category: category, 
        label: label, 
        value: value,
        location: location,
        uri: uri,
        subModuleName:"Marketing"
    }
    if(typeof dmpa5 !== 'undefined'){
        dmpa5(dmpaType, dmpaEvent, eData);
    }
}

$(function () {
    GATool();
});
(function (){
	var globalScript = {
		init: function () {
			var _this = this
			if (!$('body').hasClass('huawei-v4')) {
				$('body').addClass('huawei-v4')
			}
			if (('ontouchstart' in window || navigator.msMaxTouchPoints > 0) && window.matchMedia('screen and (max-width: 1199px)').matches) {
				$('html').addClass('touch')
			} else {
				$('html').addClass('no-touch')
			}
			$('html').attr('data-force-light', '');
			this.dropdown()
			this.browserDetector()
			this.detectFocusOnKeyPress()
			$(window).on('resize', function () {
				_this.initParallax()
			})
		},

		browserDetector: function () {
			var browser = window.navigator.appVersion
			if (browser.indexOf('Huawei') !== -1 || browser.indexOf('HUAWEI') !== -1) {
				$('body').addClass('huawei-device')
			}
		},

		initParallax: function () {
			if ($('.js-parallax-element').length) {
				var parallaxScroll = null
				if ($(window).width() > 1199) {
					parallaxScroll = skrollr.init({
						smoothScrollingDuration: 400,
						forceHeight: false,
					})
					if($('html').hasClass('no-touch')){
						$('html,body').css('overflow','auto')
					}
				} else {
					if ($('html').hasClass('skrollr') && parallaxScroll) {
						parallaxScroll.destroy()
					}
				}
			}
		},

		dropdown: function () {
			var dropdownOption = '.js-dropdown-group-option'
			var dropdown = '.js-dropdown-group'
			var dropdownBtn = '.js-dropdown-group-btn'
			var dropdownBtnText = '.js-dropdown-group-text'
			var dropdownList = '.js-dropdown-group-list'
			var openClass = 'dropdown-group__btn--open'
			var selectedClass = 'dropdown-group__list-button--selected'

			if ($(dropdown).length) {
				$(dropdownBtn).on('click', function () {
					var $this = $(this)
					if ($this.hasClass(openClass)) {
						$this.next().stop().slideUp()
						$this.removeClass(openClass)
					} else {
						$this.next().stop().delay(150).slideDown(200)
						$this.addClass(openClass)
					}
				})
				$(dropdownOption).on('click', function () {
					var $this = $(this)
					var $dropdown = $this.closest(dropdown)
					var text = $this.text()
					$dropdown.find(dropdownBtnText).text(text)
					$dropdown.find(dropdownBtn).removeClass(openClass)
					$dropdown.find(dropdownList).stop().slideUp(200)
					$this.closest(dropdownList).find(dropdownOption).removeClass(selectedClass)
					$this.addClass(selectedClass)
				})
			}
		},

		detectFocusOnKeyPress: function () {
			var activeFocus = 'active-focus'
			// add class when tab is pressed
			$(document).on('keydown', function (e) {
				var keyCode = e.keyCode || e.which
				if (keyCode === 9) {
					$('body').addClass(activeFocus)
				}
			})

			// remove class on click
			$(document).on('click', function () {
				if ($('body').hasClass(activeFocus)) {
					$('body').removeClass(activeFocus)
				}
			})
		}
	}

	$(function () {
		globalScript.init()
	})

	$(window).on('load', function () {
		setTimeout(function () {
			$('html').addClass('loaded')
			globalScript.initParallax()
		}, 10)
	});

}());
(function (window, factory) {
    let commonLazy = factory(window, window.document);
    window.commonLazy = commonLazy;
}(typeof window != 'undefined' ?
        window : {},
    function l(window, document) {
        const forEach = Array.prototype.forEach;
        const commonLazyDefaults = {
            lazyClass: "common-lazyload",
            loadedClass: "success-img",
            loadingClass: "common-lazyloading",
            errorClass: "common-lazyerror",
            srcAttr: "data-src",
            srcsetAttr: "data-srcset",
            init: true,
            expFactor: 1.2,
        };
        let commonLazyCfg = window.commonLazyConfig || window.commonLazyConfig || {};
        for (prop in commonLazyDefaults) {
            if (!(prop in commonLazyCfg)) {
                commonLazyCfg[prop] = commonLazyDefaults[prop];
            }
        }
        function imageObserve(cfg) {
            return obj = new IntersectionObserver((entries, self)=> {
                entries.forEach(function (entry) {
                    // 通过该属性判断元素是否出现在视口内
                    if (entry.isIntersecting) {
                        const target = entry.target;
                        lazyUnveil(target, cfg, function () {
                            self.unobserve(target);
                        })
                    }
                });
            }, {
                //  threshold
                //  一个数字或一个数字数组，表示目标可见度达到多少百分比时，观察器的回调就应该执行。
                //  如果只想在能见度超过 50% 时检测，可以使用 0.5 的值。
                //  如果希望每次能见度超过 25% 时都执行回调，则需要指定数组 [0, 0.25, 0.5, 0.75, 1]。
                //  默认值为 0（这意味着只要有一个像素可见，回调就会运行）。
                //  值为 1.0 意味着在每个像素都可见之前，阈值不会被认为已通过。
                threshold: [0, 0.01, 0.25, 0.5, 0.75, 1],
                rootMargin: (window.innerHeight * cfg.expFactor) + "px " + (window.innerWidth * cfg.expFactor) + "px"
            });
        }

        function init(obj, cfg) {
            cfg = cfg || {}
            for (prop in commonLazyCfg) {
                if (!(prop in cfg)) {
                    cfg[prop] = commonLazyDefaults[prop];
                }
            }
            obj = obj || ("." + cfg.lazyClass)
            let lazyEle = unifyDom(obj) || [];
            lazyEle.forEach((lazyItem) => {
                imageObserve(cfg).observe(lazyItem);
            });
        }
        const regImg = /^img$/i,
            regPicture = /^picture$/i,
            _getAttribute = "getAttribute";
        if (commonLazyCfg.init) {
            init();
        }
        function lazyUnveil(ele, cfg, fn) {
            let src = ele[_getAttribute](cfg.srcAttr),
                srcset = ele[_getAttribute](cfg.srcsetAttr),
                isImg = regImg.test(ele.nodeName),
                parent, isPicture;

            if (isImg) {
                src && (ele.src = src);
                parent = ele.parentNode;
                isPicture = parent && regPicture.test(parent.nodeName || "");
            }
            if (isPicture) {
                let sources = Array.from(parent.getElementsByTagName("source")) || []
                sources.forEach(function (item) {
                    handleSources(item, cfg)
                })
            }
            if (srcset) {
                ele.setAttribute("srcset", srcset);
            }
            if (!isImg && !isPicture && src) {
                handleBackgroundUrl(ele, cfg);
            }

            addClass(ele, cfg.loadedClass);
            if (typeof fn == 'function') {
                fn();
            }
        };
        function handleBackgroundUrl(ele, cfg) {
            let srcUrl, found = false; // 存储不同分辨率的背景图像的 URL
            const srcMap = ele.getAttribute(cfg.srcAttr).split(','); // 获取所有分辨率的背景图像的 URL
            const srcList = []; // 获取所有分辨率的背景图像的 URL
            for (let i = 0; i < srcMap.length; i++) {
                let urlMap = srcMap[i].split(/:/); // 按宽度和 URL 分割字符串，例如 "url1:::(max-width: 991.98px),url2:(max-width: 991.98px)"
                let newUrlMap = [urlMap.shift(), urlMap.join(':')]
                srcList.push(newUrlMap);
                if (newUrlMap[0] && window.matchMedia(newUrlMap[1]).matches) {
                    srcUrl = newUrlMap[0];
                    found = true;
                    break;
                }
            }
            let defaultImgSrc = srcList[srcList.length - 1][0];
            if (!found && defaultImgSrc) {
                srcUrl = defaultImgSrc;
            }
            srcUrl && (ele.style.backgroundImage = `url(${srcUrl})`);
        }
        function handleSources(source, cfg) {
            let sourceSrcset = source[_getAttribute](cfg.srcsetAttr);
            if (sourceSrcset) {
                source.setAttribute("srcset", sourceSrcset);
            }
        };

        let regClassCache = {};
        function hasClass(ele, cls) {
            if (!regClassCache[cls]) {
                regClassCache[cls] = new RegExp("(\\s|^)" + cls + "(\\s|$)");
            }
            return (regClassCache[cls].test(ele[_getAttribute]("class") || "") && regClassCache[cls]);
        };


        function addClass(ele, cls) {
            if (!hasClass(ele, cls)) {
                ele.setAttribute("class", (ele[_getAttribute]("class") || "").trim() + " " + cls);
            }
        };
        function removeClass(ele, cls) {
            let reg;
            if ((reg = hasClass(ele, cls))) {
                ele.setAttribute("class", (ele[_getAttribute]("class") || "").replace(reg, " "));
            }
        };
        function isDOMElement(ele) {
            return ele && typeof ele === 'object' && 'nodeType' in ele && ele.nodeType === 1;
        }
        function unifyDom(obj) {
            if (isDOMElement(obj)) {
                return [obj];
            } else if (Array.isArray(obj) && obj.every(item => isDOMElement(item))) {
                return obj;
            } else if (obj instanceof jQuery) {
                return obj.get();
            } else if (typeof obj === 'string') {
                return document.querySelectorAll(obj);
            } else {
                return document.querySelectorAll('.' + commonLazyCfg.lazyClass);
            }
        }
        return init;
    }
))
;window.__afterResponseCbTasks = window.__afterResponseCbTasks || [];

/**
 * 该函数用于整体执行vue组件中push到__afterResponseCbTasks中的电商逻辑执行函数，
 * 不用再在该文件注册组件的电商执行逻辑
 */
function runEcTasks(){
    if(window.__afterResponseCbTasks && window.__afterResponseCbTasks.length){
        __afterResponseCbTasks.forEach(function(taskFunc){
            if(typeof taskFunc === 'function'){
                try{
                    taskFunc();
                }catch(e){}
            }
        })
    }
}

// 添加电商购买动作 到 series list / model list / psp list / selling point组件
var ecEnableEcommerceLogic = function () {
    var $buyButton = $('.series-list-component,.model-list-component,.psp-list-component,.products-display-component,.series-products-display-box,.pdp-compare-component,.wearables-hero-banner-box,.wearables-product-card-box,.laptops-main-product,.more-products-wrap,.plp-product-series').find('.global-buy-button');
    $buyButton.each(function () {
        if ($(this).attr('data-enableec') == 'true') {
            $(this).addClass('eCommerce-buy');
        }
    });
};

var eCommerceSiteFlag = isECommerceSite == "Self-eCommerce" || isECommerceSite == "Fusion-eCommerce";

$(function () {
    var siteCode = window.digitalData.page.pageInfo.siteCode || '';
    var $handleVmallBtnOrIntegratePriceComForCn = $('.series-list-component,.psp-list-component,.wearables-hero-banner-box,.wearables-product-card-box,#second-nav-buy-button,.products-display-box,.pdp-compare-component,.laptops-main-product,.more-products-wrap,.plp-product-series,.product-feature-kv-banner-component');

    if (eCommerceSiteFlag) {
        // 首页hero-carousel-component, product-card-component, product-carousel-component组件集成电商价格处理
        ecRenderEcomercePrice();
        // 当首页开启 自有电商 或 融合电商时 开启购买按钮电商购买动作
        ecEnableEcommerceLogic();

        // 极限情况：当cn 站点，也是电商站点时，价格与信息接口调用
        if (siteCode === 'cn' && $handleVmallBtnOrIntegratePriceComForCn) {
            currentPageProductMinPriceSkuMapFun();
        } else {
            // 电商价格处理
            currentPageMinPriceAndInvMapFun();

            // 电商SKU价格处理
            currentPagePrdSkuDataMapFun();
        }
        // 处理组件价格等接口信息
        renderIntegrateInfoForCompLogic();
        runEcTasks();

    } else if (siteCode === 'cn' && $handleVmallBtnOrIntegratePriceComForCn) {
        // cn 站点时，组件调用电商价格显示，以及开启vmalL button 数据调用
        currentPageProductMinPriceSkuMapFun();

        // 处理组件价格等接口信息
        renderIntegrateInfoForCompLogic();

        runEcTasks();
    }
});

// 电商或是cn站点时，请求价格接口后，各个组件价格或是购买按钮显示隐藏控制
var renderIntegrateInfoForCompLogic = function () {
    plp_model_list_comp();

    relate_products_comp();

    plp_products_hero_comp();

    series_product_compare_comp();

    plp_ads_banner_comp();

    plp_series_list_comp();

    psp_product_select_comp();

    product_display_comp();

    pdp_compare_comp();

    series_products_display_comp();

    wearables_hero_banner_comp();

    wearables_hero_card_comp();

    PLP_Main_Product_comp();

    PLP_Product_Series_comp();

    PLP_More_Products_comp();

    pdp_kv_banner_copm();

    home_main_banner_copm();

    home_galleryProdsDisplay_comp();

    search_recommended_copm();
};

// PLP Model List Component集成价格渲染
var plp_model_list_comp = function () {
    if ($('.plp-model-list') && $('.plp-model-list').length > 0) {
        ecDataModelList.init();
    }
};


// Products Hero Component集成价格渲染
var plp_products_hero_comp = function () {
    if ($('.h02-product-listing-hero') && $('.h02-product-listing-hero').length > 0) {
        $('.h02-product-listing-hero').each(function () {
            //电商站点初次组件渲染时，价格和购买按钮逻辑渲染
            h02ProductListingHero.handlePriceAndBuyBtnTextForECommerceSite();
        });
    }
};

//Relate Products Component集成价格渲染
var relate_products_comp = function () {
    if ($('.relate-product-main') && $('.relate-product-main').length > 0) {
        if (eCommerceSiteFlag) {
            // 先设置按钮文字
            setRelateProductCompButtonText();
            //页面一加载初次渲染价格信息和购买按钮逻辑
            renderRelateProductCompPriceForECommerceSite();
        }
    }
};

// Series Product Compare Component集成价格渲染
var series_product_compare_comp = function () {
    if ($('.series-main') && $('.series-main').length > 0) {
        if (eCommerceSiteFlag) {
            // 先设置按钮文字
            compareSetButtonText();
            renderProductPriceInfoForECommerceSite();
        }
    }
};

// PLP ads banner component集成价格渲染
var plp_ads_banner_comp = function () {
    if ($('.plp-ads-banner') && $('.plp-ads-banner').length > 0) {
        v4_ec_data_PLPAdsBanner.init();
    }
};

// PLP Series List Component集成价格渲染
var plp_series_list_comp = function () {
    if ($('.plp-series-list') && $('.plp-series-list').length > 0) {
        ec_data_seriesList.init();
    }
};

// Product Select Component集成价格渲染
var psp_product_select_comp = function () {
    if ($('.product-sku-list') && $('.product-sku-list').length > 0) {
        ec_data_productSkuList.init();
        productSkuList.handleMatchHeight();
    }
};

//Products Display Component集成价格渲染
var product_display_comp = function () {
    if ($('.products-display-box') && $('.products-display-box').length > 0) {
        // 渲染电商价格信息和Buy按钮
        productsDisplayFunc.renderProductPriceInfoAndBuyBtn();

        // 逐行元素水平对齐
        productsDisplayFunc.eleMatchHeight($('.products-display-component'));
    }
};

//PLP-Product Comparison Component集成价格渲染
var pdp_compare_comp = function () {
    let $pdpCompareComp = $('.pdp-compare-component');

    if ($pdpCompareComp.hasClass('js-pdp-compare')) {
        window.ecDataPdpCompareComponent && ecDataPdpCompareComponent.init();
    }
};

//Series Products Display Component集成价格渲染
var series_products_display_comp = function () {
    if ($('.series-products-display-box') && $('.series-products-display-box').length > 0) {
        if (eCommerceSiteFlag) {
            // 产品电商价格集成数据渲染
            handleSeriesProductsDisplayProductEcPrice();
        }
    }
};

//Wearables Hero Banner Component集成价格渲染
var wearables_hero_banner_comp = function () {
    if ($('.wearables-hero-banner-box') && $('.wearables-hero-banner-box').length > 0) {
        ec_data_heroBanner.init();
    }
};


//Wearables Product Card Component集成价格渲染
var wearables_hero_card_comp = function () {
    if ($('.wearables-product-card-box') && $('.wearables-product-card-box').length > 0) {
        // 价格和购买按钮逻辑处理
        wearables_productCard_data.init();
    }
};

//PLP-Main Product Component集成价格渲染
var PLP_Main_Product_comp = function () {
    if ($('.laptops-main-product') && $('.laptops-main-product').length > 0) {
        plp_mainProduct_data.init();
    }
};

//PLP-Banner-Product集成价格渲染
var PLP_Product_Series_comp = function () {
    if ($('.plp-product-series') && $('.plp-product-series').length > 0) {
        plp_productSeries_data.init();

        // 元素等高处理
        plpProductSeriesComponent.handleMatchHeightParam();
    }
};

//PLP-Gallery-More Product集成价格渲染
var PLP_More_Products_comp = function () {
    if ($('.more-products-wrap') && $('.more-products-wrap').length > 0) {
        more_products_data.init();
    }
};

// PDP-Body-Product Feature-KV Banner Component
var pdp_kv_banner_copm = function () {
    if ($('.pdp-body-product-feature-kv-banner') && $('.pdp-body-product-feature-kv-banner').length > 0) {
        pdp_body_productFeatureKvBanner.init();
    }
};

//Home-Banner-Main Banner集成价格渲染
var home_main_banner_copm = function () {
    if ($('.home-main-banner') && $('.home-main-banner').length > 0 && eCommerceSiteFlag) {
        home_mainBanner_data.init();
    }
};

//Home-Gallery-Products Display-Multiple集成价格渲染
var home_galleryProdsDisplay_comp = function () {
    if ($('.gallery-products-display-component-wrapper').length && eCommerceSiteFlag) {
        home_galleryProdsDisplay_data.init();
    }
};

//search_recommended集成价格渲染
let search_recommended_copm = function () {
    if ($('.search-recommended-component') && $('.search-recommended-component').length > 0 && eCommerceSiteFlag) {
        search_recommended_data.init();
    }
};
(function (){
    var n04PlatformSelection = { // this name should be written in camelCase
        $selector: $('.n04-platform-selection'),
        $platformToggle: $('.platform-selection__toggle'),
        $plateformClose: $('.n04-platform-selection .icon-close'),
        $platformContent: $('.platform-selection__content'),
        platformSelectionOpenedClass: 'platform-selection--opened',
        platformToggleOpenedClass: 'platform-selection__toggle--opened',
        platformToggleDisabledClass: 'platform-selection__toggle--disabled',
        $secondNav: $('#second-navigation-v4'),
        $newsSecondNav: $('#news-second-navigation-v4'),
        $headerNav: $('.v4.header'),
        $headerPl: $('.header-placeholder'),
        $mainNav: $('.header .n01-main-navigation'),
        headerNavFlag: true,
        $ipJump:$(".ip-jump-wrap"),
        navVersion: $("#header-v4 #mainNav").val() || 'nav-v1', //主导航版本，默认：nav-v1
        uiBoundaryVal: 1200, // PC和移动端UI切换边界值，默认 1200
        init: function () {
            this.uiBoundaryVal = this.navVersion == 'nav-v1' || n04PlatformSelection.isV5Version() ? 1200 : 1366;
            if (this.$selector.length) {
                this.togglePlatform();
            }
            this.handlePlatformContainer();
            this.handleSecondNavScroll();
            this.addOutline();
            this.$headerNav.data('n04PlatformSelection', n04PlatformSelection);
        },
        /*
         * 为无障碍需求修改代码，主要修复不正确的tab切换顺序
         */
        addOutline:function(){

            var _this = this;

            /* 为隐藏的按钮添加focus事件，让tab键可以选中*/

            $('.dropdown__card_link_btn').on('focus',function(){
                $(this).parent().siblings('.btn').addClass('h-active-btn');
                $(this).parent().parent().addClass('h-active-btns');

                $(this).parent().siblings('.btn').last().on('blur',function(){
                    $(this).parent().children('.btn').removeClass('h-active-btn');
                    $(this).parent().removeClass('h-active-btns');
                })
            })

            /* 处理图片外层的a标签无法显示外边框问题 */
            $(".dropdown__card_link_btn").on('focus',function(){
                if($('body').hasClass('active-focus')){
                    $(this).parent().css("border",'1px solid #d20a2c');
                }else{
                    $(this).parent().css("border",'none');
                }
            })

            $(".dropdown__card_link_btn").on('blur',function(){
                $(this).parent().css("border",'none');
            })

            /* 特殊结构样式处理 */

            $(".h-dropdown__card_link").on('focus',function(){
                $(this).children().css("border",'1px solid #d20a2c');
            })
            $(".h-dropdown__card_link").on('blur',function(){
                $(this).children().css("border",'none');
            })

            $(window).on('load resize',function(){
                /* 移动端处理导航下拉结构 */
                if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                    $(".dropdown__order").each(function(){
                        $(this).insertBefore($(this).siblings());
                    })
                }else{
                    $(".dropdown__order").each(function(){
                        $(this).insertAfter($(this).siblings());
                    })
                }
            })
        },
        handlePlatformContainer: function () {
            var _this = this;
            if (window.pageCategory == 'homepage' && window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                _this.handleInitTop(_this);
                window.addEventListener('scroll',function () {
                    _this.handleInitTop(_this);
                });
            }
            var isIncludedPageOrTemplate = window.digitalData ? window.digitalData.page.category.pageType === 'homepage'
                                           || window.digitalData.page.category.pageType === 'support' : '';
            var pcResolution = window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui');
            var hasHideClassName = _this.$headerNav.hasClass('slide-down-corporation');
            var hasForumName = $('.huawei-forum').length;
            if(isIncludedPageOrTemplate && hasHideClassName && pcResolution && !hasForumName){
                window.addEventListener('scroll',function () {
                    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                    if (scrollTop > 1) {
                        _this.$selector.slideUp(300);
                    } else if (scrollTop < 1) {
                        _this.$selector.slideDown(300);
                    }
                });
            }
            let scrollTimer = null;
            window.addEventListener('scroll',function () {
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                if (scrollTop > 1) {
                    if (!scrollTimer) {
                        scrollTimer = setTimeout(() => {
                            if(_this.$headerNav.hasClass('header-scroll')){
                                return;
                            }
                            _this.$headerNav.addClass('header-scroll');
                            scrollTimer = null;
                        }, 250);
                    }
                } else if (scrollTop < 1) {
                    _this.$headerNav.removeClass('header-scroll');
                    if (scrollTimer) {
                        clearTimeout(scrollTimer);
                        scrollTimer = null;
                    }
                }
            });

        },
        handleSecondNavScroll: function(){
            /**
             * 向下滚动页面，一级导航，二级导航 均隐藏
             * 向上滚动页面，二级导航显示
             */
            if(!$('.second-navigation-new-version').length){
                return;
            }
            let _this = this;
            let $secNav = $('.v4.n06-second-navigation');
            let placeholderHeight = $secNav.height();
            let $placeholderDom = $('.second-navigation-placeholder-new-version');
            $placeholderDom && $placeholderDom.height(placeholderHeight);
            $secNav.removeClass('opacity');
            let initialHeight = 0;
            let rollHeight = 0;
            let v4CssStyle = {'position':'fixed','top':0,'color':'#fff','background':'#fff'};
            let headerAndAdbannerHeight = 0;
            let isSecondV5Version = $secNav.hasClass('second-navigation-v5-style');
            let $mktAdBanner = $('.v4.mkt-ad-banner');
            let v4headerHeight = $('.v4.header').height() || $('.header.site-header').height();
            let adBannerHeight = $mktAdBanner.height() || 0;
            let navigationPlaceholderHeight = $placeholderDom.height()||0;
            if($mktAdBanner.length && $mktAdBanner.css('display') ==='none'){
                adBannerHeight = 0;
            }
            headerAndAdbannerHeight = v4headerHeight + adBannerHeight;
            if(Granite && Granite.author){
                return;
            }
            if(parseInt($secNav.offset().top) > headerAndAdbannerHeight+navigationPlaceholderHeight){
                isSecondV5Version?
                    $secNav.addClass('background-blur-v5'):"";
            }
            window.addEventListener("scroll",(event)=>{
                initialHeight = document.documentElement.scrollTop || document.body.scrollTop;
                if (rollHeight > initialHeight) {
                    isSecondV5Version?
                        $secNav.addClass('background-blur-v5'):
                        $secNav.css(v4CssStyle);
                } else {
                    isSecondV5Version?
                        $secNav.addClass('background-blur-v5'):
                        $secNav.css({'position':'fixed','top': '-'+ placeholderHeight +'px'});
                }
                if(initialHeight < headerAndAdbannerHeight){
                    isSecondV5Version?
                        $secNav.removeClass('background-blur-v5').addClass('normalCssColor'):
                        $secNav.css({'position':'absolute','top':'auto'});
                }

                Promise.resolve().then(()=>{
                    rollHeight = initialHeight;
                });
            })
        },
        handleInitTop: function (_this) {
            var userAgentInfo = navigator.userAgent.toLowerCase();
            var isIE11 = !!window.ActiveXObject ? !!window.ActiveXObject : "ActiveXObject" in window,
                isIE = userAgentInfo.toUpperCase().indexOf("MSIE") > -1;
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            if( _this.$selector.length){
                if (scrollTop > 1 && _this.headerNavFlag) {
                    _this.headerNavFlag = false;
                    _this.$headerNav.addClass('header-move');
                    _this.$headerPl.addClass('header-placeholder-pl');
                    if (!_this.$platformToggle.hasClass(_this.platformToggleDisabledClass)) {
                        if (_this.$platformToggle.hasClass(_this.platformToggleOpenedClass)) {
                            _this.$platformToggle.removeClass(_this.platformToggleOpenedClass);
                            $(this).attr("aria-expanded",false);
                            _this.$platformContent.stop().slideUp(400, function () {
                                _this.$selector.removeClass(_this.platformSelectionOpenedClass);
                            });
                        }
                    }
                    if(isIE11 || isIE){
                        $('.n12-search').addClass('header-move');
                    }
                } else if (scrollTop < 1 && !_this.headerNavFlag) {
                    _this.headerNavFlag = true;
                    _this.$headerNav.removeClass('header-move');
                    _this.$headerPl.removeClass('header-placeholder-pl');
                    if(isIE11 || isIE){
                        $('.n12-search').removeClass('header-move');
                    }
                }
            }else{
                if (scrollTop > 1 && _this.headerNavFlag) {
                    _this.headerNavFlag = false
                    $('.v4.n01-main-navigation').addClass('main-navigation_white')
                } else if (scrollTop < 1 && !_this.headerNavFlag) {
                    _this.headerNavFlag = true
                    $('.v4.n01-main-navigation').removeClass('main-navigation_white')

                }
            }

        },
        togglePlatform: function () {
            var _this = this;
            _this.$platformToggle.on('click', function () {
                if (!$(this).hasClass(_this.platformToggleDisabledClass)) {
                    if (!$(this).hasClass(_this.platformToggleOpenedClass)) {
                        $(this).addClass(_this.platformToggleOpenedClass);
                        $(this).attr("aria-expanded",true);

                        /* control the platform's order  */
                        $(this).siblings().find("a[href]").last().on("blur",function(){
                            /* 离开當前彈窗内最後一個元素時, 选框应该回到开始关闭按钮那里，使用户可以关闭当前弹窗 */
                            $(this).parents(".platform-selection__content").siblings().focus();
                        })

                        _this.showPlatformSelection();
                        if($('.v4.n12-search.popup.nav-v2').hasClass('popup--visible') && _this.$headerNav.hasClass('v5-style')){
                            $('.v5-style .js-open-search').click();
                        }
                    } else {
                        $(this).removeClass(_this.platformToggleOpenedClass);
                        $(this).attr("aria-expanded",false);

                        _this.closePlatformSelection();
                    }
                }
                if(n04PlatformSelection.isV5Version()){
                    var mainNavWrapHeight = $('.v5-style .main-nav-wrap').outerHeight(true);
                    var headerNavHeight = _this.$headerNav.height();
                    var platformToggleHeight = _this.$platformToggle.height();
                    var platformBottom = '';
                    if((window.innerWidth > 1079 && window.innerWidth < 1199.98) || (_this.$headerNav.hasClass('mb-ui'))) {
                        platformBottom = window.innerHeight - headerNavHeight - mainNavWrapHeight - platformToggleHeight;
                        _this.$selector.css('bottom', Math.ceil(platformBottom));
                    }
                }
            });
            // 关闭icon事件
            _this.$plateformClose.on('click',function (){
                _this.$platformToggle.removeClass(_this.platformToggleOpenedClass);
                _this.closePlatformSelection();
            });

        },
        // 展开平台选择内容区域
        showPlatformSelection:function (){
            var _this = this;

            var $navPopup = $('.main-nav').find('.popup');
            var $headerHeight = $("#header-v4").height();

            var $selectionContentHeight = 0;
            if($(".platform-selection__content").length){
                $selectionContentHeight = $(".platform-selection__content").height();
            }

            _this.$selector.addClass(_this.platformSelectionOpenedClass);

            if((window.innerWidth > 1079 && window.innerWidth < 1199.98) || (_this.$headerNav.hasClass('mb-ui'))){
                _this.$headerNav.hasClass('v5-style')?_this.$selector.removeClass('no-height-v5'):'';
            }
            // 适配页面UI
            _this.adaptPageUI();

            _this.closeFilter();

            // 点击展开时，新版plp页面的二级导航需要联动（注：固定定位的二级导航才会联动）
            if($(".plp-series-list.js-nav-fixed").length){
                $(".productnav").addClass("js-select-opened");
                $(".productnav").animate({top:$headerHeight + $selectionContentHeight},150);
                if($(".js-fixed-position").length){
                    $(".js-fixed-position").animate({top:$headerHeight + $selectionContentHeight},600);
                }
            }
            setTimeout(function () {
                _this.$platformContent.stop().slideDown(300);
                if (window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')) {
                    if ($navPopup.is(':visible')) {
                        $navPopup.slideUp(400);
                    }
                    $('.main-nav-wrap .nav-submenu-item.open').length?$('.v5-style .nav-menuback-button').fadeOut(200):'';
                    $('.main-nav__link--opened').attr("aria-expanded",false);
                    $('.main-nav__link--opened').removeClass('main-nav__link--opened');

                }
            }, 20);
        },
        // 适配各页面UI（因顶部区域弹窗组件变化所影响的）
        adaptPageUI:function (){
            var _this = this;
            if(Mkt.Util.windowWidth() < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                // Mobile UI适配
                var headerHeight = _this.$headerNav.innerHeight();
                if($("#locationSecret").is(':visible')) {
                    // 服务店查询页 且 含有地理位置定位弹窗UI 适配
                    var locationH = $('#locationSecret').height();
                    headerHeight += locationH;
                }
                var mainNavH = _this.$mainNav.height();

                if(!_this.$headerNav.hasClass('v5-style')){
                    _this.$selector.css("height","calc(100% - "+ (headerHeight - mainNavH) +"px");
                }else{
                    var mainNavWrapHeight = $('.v5-style .main-nav-wrap').outerHeight(true);
                    var platformToggleHeight = _this.$platformToggle.height();
                    var diffHeight = window.innerHeight - headerHeight;
                    window.innerWidth < 1080 ?
                    _this.$selector.css("height", diffHeight +"px") :
                    _this.$selector.css("height",(mainNavWrapHeight + platformToggleHeight) +"px");
                }
            }
        },
        // 收起平台选择内容区域
        closePlatformSelection:function (){
            var _this = this;
            var $headerHeight = $("#header-v4").height();
            if($(".plp-series-list.js-nav-fixed").length) {
                $(".productnav").removeClass("js-select-opened");
                $(".productnav").animate({top: $headerHeight}, 50);
                if($(".js-fixed-position").length){
                    $(".js-fixed-position").animate({top: $headerHeight}, 400);
                }
            }
            let platContentTimer = 400;
            if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                platContentTimer = $('.v4.header.v5-style').length>0?0:400;
            }
            _this.$platformContent.stop().slideUp(platContentTimer, ()=> {
                _this.$selector.removeClass(_this.platformSelectionOpenedClass);
            });
            if (window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')) {
                _this.$selector.removeAttr('style');
                $('.main-nav-wrap .nav-submenu-item.open').length?$('.v5-style .nav-menuback-button').fadeIn(200):'';
                if(_this.$headerNav.hasClass('v5-style')){
                    _this.$selector.addClass('no-height-v5');
                }
            }
        },
        closeFilter: function () {
            $('.js-pf-content').removeClass('product-filter__container--visible');
            $('.js-pf-button').removeClass('product-filter__button--expanded');
            $('.js-pf-items').stop().slideUp();
        },
        isV5Version: function(){
            if(this.$headerNav.length < 0){
                return;
            }
            return this.$headerNav.hasClass('v5-style');
        },

    };

    $(function () {
        n04PlatformSelection.init();
    });
}());
(function(){
    var handleMainNavigation = {
        // this name should be written in camelCase
        $headerNav: $('.v4.header'),
        $selector: $('.n01-main-navigation'),
        $mainNav: $('.main-nav'),
        mainNavOpenedClass: 'main-nav--opened',
        mainNavItem: '.main-nav__item',
        mainNavItemVisibleClass: 'main-nav__item--visible',
        navLink: '.main-nav__link',
        navLinkOpenedClass: 'main-nav__link--opened',
        navLinkTransparentClass: 'main-nav__link--transparent',
        searchOpenBtn: '.js-open-search',
        searchPopup: '.n12-search',
        openedSearch: false,
        $loginV4:$(".login-v4-wrap"),
        $loginV4OpenedClass:"active",
        $ipJump:$(".ip-jump-wrap"),
        popup: '.popup',
        popupCloseBtn: '.js-close-popup',
        popupVisibleClass: 'popup--visible',
        header: '.header',
        popupOpenedClass: 'header--popup-opened',
        popupOpenedTimer:null,
        isPopupOpened: false,
        $navToggle: $('.js-nav-toggle'),
        navToggleActiveClass: 'nav-toggle--active',
        $platformToggle: $('.js-platform-toggle'),
        $platformModule: $('.platform-selection'),
        $platformContent: $('.platform-selection__content'),
        platformToggleVisibleClass: 'platform-selection__toggle--visible',
        platformToggleOpenedClass: 'platform-selection__toggle--opened',
        platformToggleDisabledClass: 'platform-selection__toggle--disabled',
        navVersion: $("#header-v4 #mainNav").val() || 'nav-v1', //主导航版本，默认：nav-v1
        uiBoundaryVal: 1200, // PC和移动端UI切换边界值，默认 1200
        pcLfNavW: 0,  // PC端左侧主导航宽度
        pcRgNavW: 0,  // PC端右侧主导航宽度
        pcAddonsW: 0, // PC端icons区域宽度
        otherAreaW:0, // Header中除主导航外其他元素区域宽度之和
        topScroll: 0,
        isScrollDisabled: false,
        scrollTimer: null,
        pageTypeNavFlag: false,
        stopBubblingClass: '.v4.n12-search,.v4.n02-expanded-products .dropdown__right,.v4.n03-expanded-support .dropdown__right',
        init: function () {
            var _this = this;
            _this.uiBoundaryVal = _this.navVersion === 'nav-v1' || handleMainNavigation.isV5Version() ? 1200 : 1366;
            if (this.$selector.length) {
                this.calcNewUIBoundaryVal();
                this.calcMainNavWidth();
                this.navLinksHover();
                this.bindNavLinkClick();
                this.bindSearchClick();
                this.handleV5SearchClick();
                this.bindClosePopupClick();
                this.bindNavToggleClick();
                this.bindLoginToggleClick();
                this.bindIpJump();
                this.bindHaExposure();
                this.bindHaListener();
                this.handleShopCartClick();
                this.bindSubmenuItemGa();
            }
        },
        // 计算新UI切换边界
        calcNewUIBoundaryVal:function(){
            var currWindowW = Mkt.Util.windowWidth();
            if(this.navVersion === 'nav-v2' && currWindowW > handleMainNavigation.handleContrastWidth()){
                // 计算左右主导航 宽度
                var $lfNav = $('.v4.n01-main-navigation.nav-v2 .main-nav .lf-nav');
                var $rgNav = $('.v4.n01-main-navigation.nav-v2 .main-nav .rg-nav');
                this.pcLfNavW = Math.round($lfNav.width());
                this.pcRgNavW = Math.round($rgNav.width());

                // 计算 右侧icon区域宽度
                var $navAddons = $('.v4.n01-main-navigation.nav-v2 .nav-addons');
                this.pcAddonsW = Math.round($navAddons.width());

                // 计算 版心区域右边框定位
                var mainPadding = 80;
                if(currWindowW < 1600 && currWindowW >= 768){
                    // 当前UI规则：[768,1600)分辨率，版心距离页面边距为40px
                    mainPadding = 40;
                }

                // 其他区域宽度：logo宽度加主导航左右间距
                var otherW = 110 + 64 + 40;
                if(handleMainNavigation.isV5Version()){
                    mainPadding = 80;
                    otherW = 110 + 64;
                }
                // 获取新UI切换边界值
                this.uiBoundaryVal = this.pcLfNavW + this.pcRgNavW + this.pcAddonsW + otherW  + mainPadding*2;

                this.otherAreaW = this.pcAddonsW + otherW  + mainPadding*2;
            }
        },
        /*
         * 针对 新版本主导航，判断其 UI
         * 1. PC和Mobile UI 默认边界为1365px；
         * 2. 小于1365，通过响应式样式自动启用Mobile UI；
         * 3. 大于1365，通过计算主导航内容与版心区域宽度，若超出则切换为Mobile UI，此时得出新的UI切换边界（值>1365）。
         */
        calcMainNavWidth:function(){
            var _this = this;
            if(_this.navVersion === 'nav-v2'){
                var currWindowW = Mkt.Util.windowWidth();
                if(currWindowW > handleMainNavigation.handleContrastWidth()){
                    // 以新边界为依据判断是否启用 Mobile UI
                    if(currWindowW < _this.uiBoundaryVal){
                        $('#header-v4,#header-placeholder').addClass('mb-ui');
                        $('.v4.n01-main-navigation.nav-v2 .main-nav').width('100%');
                        var headerHeight = $("#header-v4").innerHeight();
                        $("#header-placeholder").css({"height":headerHeight});

                        $('.v4.n01-main-navigation.nav-v2 .main-nav,.huawei-v4 .login-v4-wrap .login-v4,.v4.n12-search').css('top',headerHeight);
                        // PC终端启用Mobile UI 需增加 产品列表横向滚动事件
                        _this.pcHorizontalDrag();
                    }else{
                        // 主导航宽度100%，使用css弹性盒 来适配nav2版本 UI
                        $('.v4.n01-main-navigation.nav-v2 .main-nav').width('100%');
                        $('#header-v4,#header-placeholder').removeClass('mb-ui');
                    }
                }else{
                    // 撤销计算类名，启用默认的响应式样式
                    $('#header-v4,#header-placeholder').removeClass('mb-ui');
                }

                if(currWindowW >= 1200 && currWindowW < 1366){
                    // PC终端启用Mobile UI 需增加 产品列表横向滚动事件
                    _this.pcHorizontalDrag();
                }
            }
        },
        handleContrastWidth: function(){
            return handleMainNavigation.isV5Version() ? 1199.98 : 1365
        },
        navLinksHover: function () {
            var _this = this;
            this.$mainNav.find(_this.popup).each(function () {
                $(this).parent().addClass('main-nav__item--has-children');
                // 无障碍相关代码
                $(this).siblings('a').attr("role","menuitem");
                $(this).siblings('a').attr("aria-expanded",false);
                $(this).siblings('a').attr("aria-haspopup",true);
            });
            $(this.navLink).hover(
                function () {
                    if (!_this.isPopupOpened && window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                        if(_this.navVersion==='nav-v1'){
                            $(this).parent().siblings().find(_this.navLink).addClass(_this.navLinkTransparentClass);
                        }
                    }
                },
                function () {
                    if (!_this.isPopupOpened && window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                        $(this).addClass('unhover');
                        _this.$mainNav.find('.' + _this.navLinkTransparentClass).removeClass(_this.navLinkTransparentClass);
                    }
                }
            );
        },
        bindNavLinkClick: function () {
            var _this = this;
            $(document).on('click', _this.navLink, function (e) {
                var $link = $(this);
                var $dropdown = $link.siblings(_this.popup);
                clearTimeout(_this.popupOpenedTimer);
                _this.openedSearch = false;
                //lazy load img
                $dropdown.find('img.lazyload-img').each(function () {
                    $(this).attr("src", $(this).attr("data-src")).removeClass("lazyload-img");
                });
                if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                    if (_this.pageTypeNavFlag) {
                        $('#header-v4').toggleClass('minisite-nav');
                    }
                    if (!$link.hasClass(_this.navLinkOpenedClass)) {
                        // if there is an open popup already, close it and clean other opened links in navigation
                        _this.closeAllPopups(false);
                    } else {
                        // if there is an open popup already, close it
                        _this.closeAllPopups(true);
                    }
                }
                if ($dropdown.length) {
                    if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                        // PC UI
                        if ($link.hasClass(_this.navLinkOpenedClass)) {
                            $link.removeClass(_this.navLinkOpenedClass);
                            $link.attr("aria-expanded",false);
                            $dropdown.removeClass(_this.popupVisibleClass);
                            $(".js-open-search").attr("aria-expanded",false);
                            $(_this.header).removeClass(_this.popupOpenedClass);
                            _this.isPopupOpened = false;
                            _this.removeUnScroll();
                            _this.enableScroll();
                        } else {
                            _this.isPopupOpened = true;
                            _this.unScroll();
                            _this.disableScroll();
                            $link.addClass(_this.navLinkOpenedClass);
                            $link.attr("aria-expanded",true);
                            $dropdown.addClass(_this.popupVisibleClass);

                            /* 使tab键被控制在弹窗内 */
                            $(".n02-expanded-products.popup--visible,.n03-expanded-support.popup--visible").find('a[href]').last().on('blur',function(){
                                $(this).parents(".dropdown").siblings(".popup__close-btn").focus();
                            })

                            if(_this.navVersion==='nav-v1'){
                                $link.parent().siblings().find(_this.navLink).addClass(_this.navLinkTransparentClass);
                            }
                            // if consumer menu is opened, close and disable it so it doesn't interfere with popups
                            _this.$platformToggle.removeClass(_this.platformToggleOpenedClass).addClass(_this.platformToggleDisabledClass);
                            _this.$platformContent.stop().slideUp(200);
                            if (!$(_this.header).hasClass(_this.popupOpenedClass)) {
                                _this.popupOpenedTimer = setTimeout(function () {
                                    $(_this.header).addClass(_this.popupOpenedClass);
                                }, 600);
                            }

                            /* 影响Tab键选择顺序，将其屏蔽掉*/
                            $(".dropdown__btns").siblings(".dropdown__card_link_btn").attr("tabindex",-1);

                            $(".dropdown__left").find(".dropdown__big-link").first().on("blur",function(){
                                $(".mCSB_outside").length >0 && $(".mCSB_outside").attr("tabindex",-1);
                            })
                        }
                    } else {
                        // Mobile UI
                        if ($link.hasClass(_this.navLinkOpenedClass)) {
                            $link.removeClass(_this.navLinkOpenedClass);
                            $link.attr("aria-expanded",false);
                            $dropdown.stop().slideUp(400);
                        } else {
                            $('.' + _this.navLinkOpenedClass).siblings(_this.popup).stop().slideUp(400);
                            $('.' + _this.navLinkOpenedClass).attr("aria-expanded",false);
                            $('.' + _this.navLinkOpenedClass).removeClass(_this.navLinkOpenedClass);
                            $link.addClass(_this.navLinkOpenedClass);
                            $link.attr("aria-expanded",true);
                            $(".dropdown__btns").siblings(".dropdown__card_link_btn").attr("tabindex",0);
                            $dropdown.stop().slideDown(500);
                        }
                    }
                }else{

                    if($(_this.header).hasClass(_this.popupOpenedClass)){
                        $(_this.header).removeClass(_this.popupOpenedClass);
                        _this.removeUnScroll();
                        _this.enableScroll();
                    }
                }
            });
        },
        bindClosePopupClick: function () {
            var _this = this;
            /* 无障碍需求,当一级导航失焦时，清除tabindex */
            $(".main-nav__item").on('blur',function(){
                $(this).removeAttr('tabindex');
            })

            $(".shop-bag-bnt").on("click", function () {
                $(this).removeAttr('tabindex');
            });
            $(".shop-bag-bnt").on('blur',function(){
                $(this).attr('tabindex',0);
            })

            $(document).on('click', _this.popupCloseBtn, function () {
                /* 无障碍需求，点击关闭按钮后，选中当前一级导航产品大类 */
                $(this).parents(".main-nav__item").attr("tabindex",-1);
                $(this).parents(".main-nav__item").focus();

                $(this).parents(".main-nav__item").find(".main-nav__link").on('blur',function() {
                    if($(this).attr("aria-expanded") == "false"){
                        $(this).parents(".main-nav__item").next().find(".main-nav__link").focus();
                    }
                })

                $(_this.header).removeClass(_this.popupOpenedClass);
                _this.closeAllPopups(false);
                _this.openedSearch = false;
                _this.removeUnScroll();
                _this.enableScroll();
            });
            $('.n12-search .js-close-popup').on('click',function(){
                $('.nav-addons').attr("tabindex",-1);
                $('.nav-addons').focus();
                $(".login-v4-wrap,.js-nav-toggle,.shop-bag-bnt,.logo").attr("tabindex",0);
            })
        },
        closeAllPopups: function (isNavLink) {
            $(this.popup).removeClass(this.popupVisibleClass);
            handleMainNavigation.handleV5SearchPopup(false);
            handleMainNavigation.handleShopCartPopup(false);
            this.$platformToggle.removeClass(this.platformToggleVisibleClass);
            $(".js-open-search").attr("aria-expanded",false);
            // remove consumer menu disable, so it can be opened again
            if (this.$platformToggle.hasClass(this.platformToggleDisabledClass)) {
                this.$platformToggle.removeClass(this.platformToggleDisabledClass);
            }
            if (!isNavLink) {
                this.isPopupOpened = false;
                // remove transparent navigation links class
                var $transparentLink = $('.' + this.navLinkTransparentClass);
                if ($transparentLink.length) {
                    $transparentLink.removeClass(this.navLinkTransparentClass);
                }
                // remove opened main nav link class
                var $openedLink = $('.' + this.navLinkOpenedClass);
                if ($openedLink.length) {
                    $openedLink.removeClass(this.navLinkOpenedClass);
                    $openedLink.attr("aria-expanded",false);
                }
            }

            if (window.closeFnList) {
                window.closeFnList.forEach(fn => {
                    if (typeof fn === 'function') {
                        fn();
                    }
                })
            }
            handleSecondTabs.handleSecondPopupCloseV5();
            setTimeout(function () {
                this.openedSearch = false;
            }, 25);
        },
        addEasingEffect: function(){
            var $aTags = this.$mainNav.find(this.mainNavItem + ' > ' + this.navLink);
            $aTags.each(function(i){
                var $ctx = $(this);
                $ctx.css({'transitionDelay': i * 0.03 +'s'});
            });
        },
        handleMainNavWrapHeightV5 :function(){
            if((window.innerWidth < this.uiBoundaryVal) || this.$headerNav.hasClass('mb-ui')){
                let $mainNavWrap = $('.v5-style .main-nav .main-nav-wrap');
                let mainNavWrapHeight = $mainNavWrap.outerHeight(true)||0;
                let calcMainNavWrapHeight = mainNavWrapHeight > 405 ? 'auto' : 365;
                let platformToggleHeight = $('.v5-style .platform-selection__toggle').height()||0;
                let ipJumpHeight = $(".ip-jump-wrap.ip-jump-v5").is(':visible')?$('.ip-jump-wrap').outerHeight(true):0||0;
                let headerNavHeight = $('.v4.header').height() - ipJumpHeight;
                $mainNavWrap.height(calcMainNavWrapHeight).css({'max-height': 'calc(100% + -'+(platformToggleHeight+headerNavHeight)+'px)'});
            }
        },
        bindNavToggleClick: function () {
            var _this = this;
            let toggleClickTimer = null;
            _this.$navToggle.on('click', mktHelpers.debounce(function () {
                clearTimeout(toggleClickTimer);
                let navToggleAndIpJumpTimer = 0;
                if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                    navToggleAndIpJumpTimer = $(".ip-jump-wrap.ip-jump-v5").is(':visible')?100:0;
                }
                handleMainNavigation.handleCloseIpJump();
                toggleClickTimer = setTimeout(()=>{
                    // if there is an open popup already, close it
                    $(".v5-style.header").hasClass('scroll-with-screen')?$(window).scrollTop(0):'';
                    $(".v4.header.v5-style.header-scroll").removeClass("header-scroll");
                    _this.closeAllPopups(true);
                    $(this).toggleClass(_this.navToggleActiveClass);
                    _this.$mainNav.toggleClass(_this.mainNavOpenedClass);
                    $(_this.header).removeClass(_this.popupOpenedClass);
                    var isBreadcrumbNav = (window.innerWidth < _this.uiBoundaryVal) || _this.$headerNav.hasClass('mb-ui');
                    handleMainNavigation.handleSubmenuPopupClose();
                    if ($(this).hasClass(_this.navToggleActiveClass)) {
                        /* 无障碍需求要求 ：菜单展开时 其他icon不应该被选中 */
                        $(".login-v4-wrap,.nav-addons__search,.shop-bag-bnt,.logo").attr("tabindex",-1);

                        /* 展开时让 选框一直存在于 popup中 循环选中 */
                        $(this).on('blur',function(){
                            if (window.innerWidth > _this.uiBoundaryVal){
                                $('.main-nav').find("a:visible[href]").first().trigger('focus');
                            }else{
                                $('.main-nav.main-nav--opened').attr("tabindex",-1).css("outline","0px");
                                $('.main-nav.main-nav--opened').focus();
                            }
                        });

                        /* 无障碍需求 展开时将属性aria-expanded设置为true */
                        $(this).attr("aria-expanded","true");
                        if ($(this).is(':visible') || isBreadcrumbNav) {
                            _this.$mainNav.find(_this.mainNavItem).addClass(_this.mainNavItemVisibleClass);
                            _this.addEasingEffect();
                            if(!handleMainNavigation.isV5Version()){
                                _this.$platformToggle.addClass(_this.platformToggleVisibleClass);
                            }
                        }
                        _this.disableScroll();
                        _this.unScroll();
                        _this.$loginV4.removeClass(_this.$loginV4OpenedClass);
                        _this.$loginV4.attr("aria-expanded",false);
                        if(handleMainNavigation.isV5Version() && isBreadcrumbNav){
                            $('.v4.n04-platform-selection').css('height',0);
                            $('.main-nav .main-nav-wrap').stop().slideDown(300,()=>{
                                var mainNavWrapHeight = $('.v5-style .main-nav-wrap').outerHeight(true);
                                var headerNavHeight = $('.v4.header').height();
                                var platformToggleHeight = $('.v5-style .platform-selection__toggle').height();
                                var $platformSelector =  $('.v5-style .n04-platform-selection');
                                var platformBottom = '';
                                platformBottom = window.innerHeight - headerNavHeight - mainNavWrapHeight - platformToggleHeight;
                                $platformSelector.css('bottom', Math.ceil(platformBottom));
                                _this.$platformToggle.addClass(_this.platformToggleVisibleClass);
                            });
                            $('.main-navigation__container .logo').addClass('hide');
                            $('.v4.header.v5-style').addClass('change-header-background');
                            $('.nav-addons .nav-addons__link.login-v4-wrap').hide();
                            $('.nav-addons__link.nv-addons__bag').hide();
                            $('.nav-addons .shop-bag-bnt').hide();
                            $('.nav-addons__link.nav-addons__search').hide();
                        }
                    } else {
                        /* 不展开时允许被选中 */
                        $(".login-v4-wrap,.nav-addons__search,.shop-bag-bnt,.logo").attr("tabindex",0);

                        /* 不展开时让 取消范围限制 */
                        $(this).off('blur');

                        /* 无障碍需求 不展开时将属性aria-expanded设置为false */
                        $(this).attr("aria-expanded","false");

                        $(_this.$mainNav.find(_this.mainNavItem).toArray().reverse()).removeClass(_this.mainNavItemVisibleClass);
                        _this.$mainNav.find('.main-nav__link').removeAttr('style');
                        if(!handleMainNavigation.isV5Version()){
                            _this.$platformToggle.removeClass(_this.platformToggleVisibleClass);
                        }
                        _this.enableScroll();
                        _this.removeUnScroll();
                        if(handleMainNavigation.isV5Version() && isBreadcrumbNav){
                            $('.main-nav .main-nav-wrap').stop().slideUp(350,function(){
                                _this.$platformToggle.removeClass(_this.platformToggleVisibleClass);
                            });
                            var navLoginWrap = $('.nav-addons .nav-addons__link.login-v4-wrap');
                            if(!navLoginWrap.hasClass('Fusion-eCommerce') && !navLoginWrap.hasClass('Self-eCommerce')){
                                navLoginWrap.show();
                            }
                            $('.main-navigation__container .logo').removeClass('hide');
                            $('.v4.header.v5-style').removeClass('change-header-background');
                            $('.nav-addons__link.nv-addons__bag').show();
                            $('.nav-addons .shop-bag-bnt').show();
                            $('.nav-addons__link.nav-addons__search').show();
                            _this.$platformToggle.removeClass(_this.platformToggleOpenedClass);
                            $('.v4.n04-platform-selection').removeClass('platform-selection--opened');
                            _this.$platformContent.stop().slideUp(200);
                        }
                    }
                    setTimeout(function () {
                        _this.openedSearch = false;
                    }, 25);
                },navToggleAndIpJumpTimer)
            }, 400 , true));
        },
        // 登录PC端交互处理
        loginV4ECommerceEvent: function(that,event){
            var _this = this;
            event.stopPropagation();
            // 登录和购物车不同时显示
            if($('.ec-mc').hasClass("on")){
                $('.ec-mc').removeClass('on');
            }
            if(that.hasClass(_this.$loginV4OpenedClass)) {
                that.removeClass(_this.$loginV4OpenedClass);
                that.attr("aria-expanded",false);
            }else {
                that.addClass(_this.$loginV4OpenedClass);
                that.attr("aria-expanded",true);
            }
        },
        // 登录移动端交互处理
        loginV4Event: function (that) {
            var _this = this;
            _this.closeAllPopups(true);
            let ipJumpTimer = 0;
            $(".v5-style.header").hasClass('scroll-with-screen')?$(window).scrollTop(0):'';
            if(_this.$ipJump.is(':visible')) {
                if($("#locationSecret").is(':visible')) {
                    var headerHeight = $("#header-v4").innerHeight();
                    $(".login-v4").css("top",headerHeight+"px");
                }else {
                    var headerHeight = $("#header-v4").height();
                    $(".login-v4").css("top",headerHeight+"px");
                }
            }else{
                if($("#locationSecret").is(':visible')) {
                    var headerHeight = $("#header-v4").innerHeight();
                    $(".login-v4").css("top",headerHeight+"px");
                }
            }
            if($(".ip-jump-wrap.ip-jump-v5").is(':visible')){
                ipJumpTimer = 300;
            }
            handleMainNavigation.handleCloseIpJump();
            setTimeout(()=>{
                that.toggleClass(_this.$loginV4OpenedClass);
                $(".v5-style.header").toggleClass('login-is-open');
                if (that.hasClass(_this.$loginV4OpenedClass)) {
                    _this.$mainNav.removeClass(_this.mainNavOpenedClass);
                    _this.$navToggle.removeClass(_this.navToggleActiveClass);
                    _this.$navToggle.attr("aria-expanded",false);
                    _this.disableScroll();
                    _this.unScroll();
                    that.attr("aria-expanded",true);
                    $(".login-v4-wrap").removeAttr('tabindex');

                    if(handleMainNavigation.isV5Version()){
                        $('.login-v4 .login-v4-cnt').stop().slideDown(150);
                        $('.main-navigation__container .logo').addClass('hide');
                        $('.nav-toggle.js-nav-toggle').hide();
                        $('.nav-addons__link.nv-addons__bag').hide();
                        $('.nav-addons .shop-bag-bnt').hide();
                        $('.nav-addons__link.nav-addons__search').hide();
                    }
                }else {
                    _this.enableScroll();
                    _this.removeUnScroll();
                    that.attr("aria-expanded",false);
                    $(".login-v4-wrap").attr('tabindex',0);
                    if(handleMainNavigation.isV5Version()) {
                        $('.login-v4 .login-v4-cnt').stop().slideUp(150);
                        _this.$mainNav.removeClass(_this.mainNavOpenedClass);
                        _this.$navToggle.removeClass(_this.navToggleActiveClass);
                        _this.$navToggle.attr("aria-expanded",false);
                        $('.js-nav-toggle').removeClass('nav-toggle--active');
                        $('.main-navigation__container .logo').removeClass('hide');
                        $('.nav-toggle.js-nav-toggle').show();
                        $('.nav-addons__link.nv-addons__bag').show();
                        $('.nav-addons .shop-bag-bnt').show();
                        $('.nav-addons__link.nav-addons__search').show();
                    }
                }
            },ipJumpTimer)
            setTimeout(function () {
                _this.openedSearch = false;
            }, 25);
        },
        // login
        bindLoginToggleClick: function(){
            var _this = this;
            var login_leave="";

            $(".login-v4-cnt").find("a:visible[href]").last().on("blur",function(){
                $('.login-v4-wrap').attr('tabindex',0);
                $('.login-v4-wrap').focus();
            })
            if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {

                /* 添加键盘事件 为无障碍操作 需求指定无论是否是融合电商都要通过enter键触发弹窗，因此提取出来*/
                _this.$loginV4.on("keydown", function (event) {
                    if(event.keyCode == 13){
                        _this.loginV4ECommerceEvent($(this),event);
                    }
                });

                $(".shop-bag").on("keydown", function(event){
                    if(event.keyCode == 13) {
                        $(this).click();
                    }
                });
                /* 是否是融合电商 */
                if (isECommerceSite == "Fusion-eCommerce") {

                    _this.$loginV4.on("click", function (event) {
                        _this.loginV4ECommerceEvent($(this),event);
                    })

                    /* 点击弹层以外消失 */
                    $("body").on("click",function(e) {
                        var $t = $(e.target);
                        if($t.hasClass("font-ico-profile")){
                            return;
                        }else{
                            $(".Fusion-eCommerce").removeClass("active");
                        }
                    });
                    /* 点击弹层边阻止冒泡 */
                    $(".login-v4-cnt").on("click",function(event){
                        event = event || window.event;
                        event.stopPropagation();
                    })
                } else {
                    _this.$loginV4.on("mouseenter", function (event) {
                        event.stopPropagation();
                        $(this).addClass(_this.$loginV4OpenedClass);
                        $(".v5-style.header").addClass('login-is-open');
                        $(this).attr("aria-expanded",true);
                        clearTimeout(login_leave);
                    });
                    _this.$loginV4.on("mouseleave",function (event) {
                        event.stopPropagation();
                        var _t =$(this);
                        login_leave=setTimeout(function () {
                            _t.removeClass(_this.$loginV4OpenedClass);
                            $(".v5-style.header").removeClass('login-is-open');
                            _t.attr("aria-expanded",false);
                        }, 300);
                    });
                }
            }else {
                _this.$loginV4.on('click',function(){
                    $(this).parents('.nav-addons').length && _this.loginV4Event($(this));
                });
                _this.$loginV4.on('keydown',function(event){
                    if(event.keyCode == 13){
                        _this.loginV4Event($(this));
                    }
                });
            }
        },
        // IP jump
        bindIpJump: function(){
            var _this = this;
            var $navPopup = $('.main-nav').find('.popup');
            if(_this.$ipJump.is(':visible')) {
                let headerHeight = $("#header-v4").height();
                $("#header-placeholder").css("height",headerHeight+"px");
                $("#header-v4").addClass("hasIp");
                $(".page-plp").addClass("hasIp");
                if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                    $navPopup.css("top",headerHeight+"px");
                }
                if (window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')) {
                    let headerHeight = $('.ip-jump-v5').length?$('.v4.n01-main-navigation').innerHeight():$("#header-v4").innerHeight();
                    if($("#locationSecret").is(':visible')) {
                        _this.$mainNav.css("top",headerHeight+"px");
                    }else {
                        _this.$mainNav.css("top",headerHeight+"px");
                    }
                }
            }else {
                if (window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')) {
                    if($("#locationSecret").is(':visible')) {
                        let headerHeight = $('.ip-jump-v5').length?$('.v4.n01-main-navigation').innerHeight():$("#header-v4").innerHeight();
                        _this.$mainNav.css("top",headerHeight+"px");
                    }
                }
            }
        },
        handleCloseIpJump: function(){
            if(!$(".ip-jump-wrap.ip-jump-v5").is(":visible")){
                return;
            }else{
                if(window.innerWidth < this.uiBoundaryVal || this.$headerNav.hasClass('mb-ui')){
                    $('.ip-jump-wrap .ipJump-close').click();
                }
            }
        },
        disableScroll: function () {
            if (!this.isScrollDisabled) {
                this.topScroll = $(window).scrollTop();
                if (window.innerWidth < this.uiBoundaryVal) {
                    $('body').addClass('scroll-disabled').css('top', -this.topScroll + 'px')
                    if ($('#second-navigation-v4').length) {
                        $('#header-v4').css('position', 'fixed');
                    }
                }
                if ($('#second-navigation-v4').length) {
                    $(window).scrollTop(0);
                }
                this.isScrollDisabled = true;
            }
        },
        enableScroll: function () {
            if (this.isScrollDisabled) {
                if (window.innerWidth < this.uiBoundaryVal) {
                    $('body').css('top', '0px').removeClass('scroll-disabled')
                    $(window).scrollTop(this.topScroll);
                    if ($('#second-navigation-v4').length) {
                        $('#header-v4').css('position', 'absolute');
                    }
                }else{
                    $(window).scrollTop(this.topScroll);
                }
                this.isScrollDisabled = false;
            }
        },
        stopBubbling:function (e){
            if(this.scrollHeight - this.clientHeight > 1){
                e.stopImmediatePropagation();
                e.preventDefault();
                var orgEvent = e.originalEvent;
                var delta = 0;
                if (orgEvent.wheelDelta) {
                    delta = -orgEvent.wheelDelta / 12;
                } else if (orgEvent.delta) {
                    delta =  orgEvent.delta / 3;
                } else if (orgEvent.deltaY) {
                    delta = -orgEvent.deltaY / 12;
                }
                var scrollTop = $(this).scrollTop();
                $(this).scrollTop(scrollTop + delta)
            }
        },
        unScroll: function () {
            var _this = this;
            if(handleMainNavigation.isV5Version()){
                if(window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')){
                    $(window).on('scroll',_this.scrollClosePopups);
                }
            }else{
                $(window).on('scroll',_this.scrollClosePopups);
            }
            if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui') && !_this.$selector.hasClass('list-navigation')) {
                $(_this.stopBubblingClass).on('mousewheel',_this.stopBubbling);
                if (typeof window.onmousewheel == 'object') {
                    window.addEventListener('mousewheel', _this.stopScroll, {
                        passive: false
                    });
                    window.addEventListener('mousewheel', _this.scrollClosePopups, {
                        passive: false
                    });
                } else {
                    window.addEventListener('DOMMouseScroll', _this.stopScroll, {
                        passive: false
                    });
                    window.addEventListener('DOMMouseScroll', _this.scrollClosePopups, {
                        passive: false
                    });
                }
            }
        },
        removeUnScroll: function () {
            var _this = this;
            if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                $(window).off('scroll', _this.scrollClosePopups);
                if (typeof window.onmousewheel == 'object') {
                    $(_this.stopBubblingClass).off('mousewheel',_this.stopBubbling);
                    window.removeEventListener('mousewheel', this.stopScroll, {
                        passive: false
                    });
                    window.removeEventListener('mousewheel', this.scrollClosePopups, {
                        passive: false
                    });
                } else {
                    window.removeEventListener('DOMMouseScroll', this.stopScroll, {
                        passive: false
                    });
                    window.removeEventListener('DOMMouseScroll', this.scrollClosePopups, {
                        passive: false
                    });
                }
            }
        },
        scrollClosePopups: function () {
            let closePopupTimerV5 = handleMainNavigation.isV5Version()?0:300;
            if ($(handleMainNavigation.header).hasClass(handleMainNavigation.popupOpenedClass)) {
                clearTimeout(handleMainNavigation.scrollTimer);
                handleMainNavigation.scrollTimer = setTimeout(function () {
                    handleMainNavigation.handleClosePopup();
                }, closePopupTimerV5);
            }
        },
        handleClosePopup: function () {
            this.closeAllPopups(false);
            if (this.pageTypeNavFlag) {
                $('#header-v4').toggleClass('minisite-nav');
            }
            $(this.header).removeClass(this.popupOpenedClass);
            $(this.searchPopup).removeClass(this.popupVisibleClass);
            $(".js-open-search").attr("aria-expanded",false);
            this.openedSearch = false;
            this.isScrollDisabled = false;
            this.removeUnScroll();
        },
        stopScroll: function (event) {
            if (event.preventDefault) {
                event.preventDefault();
            } else {
                event.returnValue = false;
            }
        },
        // PC终端启用Mobile UI时，启用鼠标横向拖动事件
        pcHorizontalDrag: function(){
            var $navContent = $('.main-navigation.nav-v2 .v4.n02-expanded-products .dropdown__wrap .dropdown__right,.main-navigation.nav-v2 .v4.n03-expanded-support .dropdown__right');
            $navContent.on("mousedown",start);
            var gapX = 0,startX = 0;
            function start(event){
                // 判断是否点击鼠标左键
                if(event.button === 0){
                    gapX = event.clientX;
                    startX = $(this).scrollLeft();

                    $(document).on("mousemove",move);
                    $(document).on("mouseup",stop);
                }
                //阻止默认事件或冒泡
                return false;
            }
            function move(event){
                // 鼠标移动的相对距离
                var left = event.clientX - gapX;
                $navContent.scrollLeft(startX - left);
                //阻止默认事件或冒泡
                return false;
            }
            function stop(){
                //解绑定
                $(document).off("mousemove",move);
                $(document).off("mouseup",stop);
            }
        },
        bindSearchClick: function () {
            var _this = this;
            if(handleMainNavigation.isV5Version()){
                return;
            }
            $(document).on('click', _this.searchOpenBtn, function () {
                handleMainNavigation.handleSearchCommonClick();
            });
        },
        handleV5SearchClick: function () {
            if(!handleMainNavigation.isV5Version()){
                return;
            }
            handleMainNavigation.stopBubblingClass = '.v4.n12-search,.v4.n02-expanded-products .dropdown__right ,' +
                                                     '.v4.n03-expanded-support .dropdown__right ,' +
                                                     '.popular-show-wrap .dropdown__row-mobile ,' +
                                                     '.popular-show-wrap .link-wrap ,' +
                                                     '.easy-autocomplete-container ul';
            var _this = this;
            $(document).on('click', _this.searchOpenBtn, function () {
                handleMainNavigation.handleSearchCommonClick();
            });

            $("body").on("click" , function(event) {
                var $target = $(event.target);
                if(!$target.hasClass("main-nav")) {
                    return;
                }else {
                    $('.js-nav-toggle').removeClass(handleMainNavigation.navToggleActiveClass);
                    handleMainNavigation.$mainNav.removeClass(handleMainNavigation.mainNavOpenedClass);
                    $(handleMainNavigation.header).removeClass(handleMainNavigation.popupOpenedClass);

                    $(".login-v4-wrap,.nav-addons__search,.shop-bag-bnt,.logo").attr("tabindex",0);
                    handleMainNavigation.$mainNav.find('.main-nav__link').removeAttr('style');
                    handleMainNavigation.$platformToggle.removeClass(handleMainNavigation.platformToggleVisibleClass);
                    handleMainNavigation.enableScroll();
                    handleMainNavigation.removeUnScroll();
                    handleMainNavigation.closeAllPopups();
                    let isBreadcrumbNav = window.innerWidth < handleMainNavigation.uiBoundaryVal || handleMainNavigation.$headerNav.hasClass('mb-ui');
                    if(handleMainNavigation.isV5Version() && isBreadcrumbNav) {
                        $('.main-nav .main-nav-wrap').stop().slideUp(350);
                        var navLoginWrap = $('.nav-addons .nav-addons__link.login-v4-wrap');
                        if (!navLoginWrap.hasClass('Fusion-eCommerce') && !navLoginWrap.hasClass('Self-eCommerce')) {
                            navLoginWrap.show();
                        }
                        $('.nav-addons__link.nav-addons__search').show();
                        $('.main-navigation__container .logo').removeClass('hide');
                        $('.v4.header.v5-style').removeClass('change-header-background');
                        $('.nav-addons .shop-bag-bnt').show();
                        $('.nav-addons__link.nv-addons__bag').show();
                        handleMainNavigation.$platformToggle.removeClass(handleMainNavigation.platformToggleOpenedClass);
                        $('.v4.n04-platform-selection').removeClass('platform-selection--opened');
                        handleMainNavigation.$platformContent.stop().slideUp(200);
                    }
                    handleMainNavigation.openedSearch = false;
                    handleMainNavigation.handleSubmenuPopupClose();
                }
            })

            $("body").on("click" , function(event) {
                var $target = $(event.target);
                if(!$target.hasClass("header")) {
                    return;
                }else{
                    $(_this.popup).removeClass(_this.popupVisibleClass);
                    $(_this.header).removeClass(_this.popupOpenedClass);
                    $(".js-open-search").attr("aria-expanded",false);
                    $(".login-v4-wrap,.js-nav-toggle,.shop-bag-bnt,.logo").attr("tabindex",0);
                    _this.openedSearch = false;
                    _this.removeUnScroll();
                    _this.enableScroll();
                    _this.closeAllPopups();
                    handleMainNavigation.handleV5SearchPopup(false);
                    if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                        var navLoginWrap = $('.nav-addons .nav-addons__link.login-v4-wrap');
                        if(!navLoginWrap.hasClass('Fusion-eCommerce') && !navLoginWrap.hasClass('Self-eCommerce')){
                            navLoginWrap.show();
                        }
                        $('.nav-toggle.js-nav-toggle').show();
                        $('.main-navigation__container .logo').removeClass('hide');
                        $('.nav-addons__link.nv-addons__bag').show().removeClass('shop-cart-nav-close');
                        $('.nav-addons .shop-bag-bnt').show();
                        $('.nav-addons__link.nav-addons__search').show().removeClass('search-close-v5-style');
                    }
                }
            })
        },
        handleV5SearchPopup: function(show){
            var _this = this;
            if(!handleMainNavigation.isV5Version()){
                return;
            }
            let shopCartPopupTimer = show?1:300;
            $('.header.v5-style .shop-cart-popup-ec').stop().slideUp(shopCartPopupTimer).removeClass('open');
            if(show){
                return (
                    $(_this.searchPopup).stop().slideDown(300 , function(){
                        $(_this.searchPopup).addClass(_this.popupVisibleClass);
                        let searchPopupHeight = $(_this.searchPopup).height();
                        $(".main-navigation__container").attr("style", "--historyNavHeight: " + searchPopupHeight + "px;");
                    })
                )
            }else{
                return (
                    $(_this.searchPopup).stop().slideUp(240, function(){
                        $(_this.searchPopup).removeClass(_this.popupVisibleClass);
                        $('.v5-style .popular-show-wrap').removeClass('search__form-container--autocomplete-visible');
                        $('.v5-style .search__form-container').removeClass('search__form-container-showV5');
                        $('.v5-style .search__form-container').removeClass('search__form-container--autocomplete-visible');
                        $('.v5-style .js-search-autocomplete').val('');
                        $('.v5-style .hot-search-v5').hide();
                        $('.v5-style .suggested-search-v5').hide();
                        $(".main-navigation__container").attr("style", "--historyNavHeight: 0px;");
                    })
                )
            }
        },
        isV5Version: function(){
            if(this.$headerNav.length < 0){
                return;
            }
            var isV5Version = this.$headerNav.hasClass('v5-style');
            return isV5Version;
        },
        handleSearchAndIpJumpTimer: function(){
            if($(".ip-jump-wrap.ip-jump-v5").is(':visible')){
                $('.v4.n12-search').addClass('hasIpJump');
            }
            let searchAndIpJumpTimer = 50;
            let _this = this;
            if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                searchAndIpJumpTimer = $(".ip-jump-wrap.ip-jump-v5").is(':visible')?100:50;
            }
            return searchAndIpJumpTimer;
        },
        handleSearchCommonClick: function(){
            var _this = this;
            var searchPopupTimer = window.innerWidth > 1080 ? 0 : 550;
            let searchAndIpJumpTimer = handleMainNavigation.handleSearchAndIpJumpTimer();
            handleMainNavigation.handleCloseIpJump();
            if ($(_this.searchPopup).length) {
                if (!_this.openedSearch) {
                    var headerHeight = $("#header-v4").innerHeight();
                    _this.openedSearch = false;
                    // if there is an open popup already, close it
                    _this.closeAllPopups(false);
                    setTimeout(function () {
                        if(!handleMainNavigation.isV5Version()){
                            $(_this.searchPopup).addClass(_this.popupVisibleClass);
                        }else {
                            setTimeout(function () {
                                $(_this.searchPopup).removeAttr('style');
                                handleMainNavigation.handleV5SearchPopup(true);
                            }, 50);
                            if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                                $('.nav-addons .nav-addons__link.login-v4-wrap').hide();
                                $('.nav-toggle.js-nav-toggle').hide();
                                $('.main-navigation__container .logo').addClass('hide');
                                $('.nav-addons__link.nv-addons__bag').hide();
                                $('.nav-addons .shop-bag-bnt').hide();
                                $('.nav-addons__link.nav-addons__search').addClass('search-close-v5-style');
                            }
                        }
                        $(".js-open-search").attr("aria-expanded",true);/* 无障碍需求优化 */
                        $(".n12-search.popup").find("a:visible[href]").last().on("blur",function(){
                            /* 无障碍需求， 根据分辨率限定 循环元素 */
                            if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                                $('.js-close-popup').focus();
                            }else{
                                $('.js-open-search').focus();
                            }
                        })
                        $(".login-v4-wrap,.js-nav-toggle,.shop-bag-bnt,.logo").attr("tabindex",-1);
                        _this.openedSearch = true;
                        if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui') ) {
                            _this.unScroll();
                        }
                        _this.disableScroll();
                        setTimeout(function () {
                            if (_this.openedSearch) {
                                $(_this.header).addClass(_this.popupOpenedClass);
                            }
                        }, searchPopupTimer);
                    }, searchAndIpJumpTimer);
                    if (window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')) {
                        // if consumer menu is opened, close and disable it so it doesn't interfere with popups
                        !handleMainNavigation.isV5Version()?
                            _this.$platformToggle.removeClass(_this.platformToggleOpenedClass).addClass(_this.platformToggleDisabledClass):
                            _this.$platformToggle.removeClass(_this.platformToggleOpenedClass);
                        _this.$platformContent.stop().slideUp(200);
                    }
                    _this.$platformToggle.removeClass(_this.platformToggleVisibleClass);
                } else {
                    _this.$platformToggle.removeClass(_this.platformToggleVisibleClass);
                    $(".js-open-search").attr("aria-expanded",false);
                    $(".login-v4-wrap,.js-nav-toggle,.shop-bag-bnt,.logo").attr("tabindex",0);
                    setTimeout( ()=> {
                        $(_this.header).removeClass(_this.popupOpenedClass);
                    }, 150);
                    _this.openedSearch = false;
                    if(!handleMainNavigation.isV5Version()){
                        $(_this.searchPopup).removeClass(_this.popupVisibleClass);
                    }else{
                        handleMainNavigation.handleV5SearchPopup(false);
                        if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                            var navLoginWrap = $('.nav-addons .nav-addons__link.login-v4-wrap');
                            if(!navLoginWrap.hasClass('Fusion-eCommerce') && !navLoginWrap.hasClass('Self-eCommerce')){
                                navLoginWrap.show();
                            }
                            $('.nav-toggle.js-nav-toggle').show();
                            $('.main-navigation__container .logo').removeClass('hide');
                            $('.nav-addons__link.nv-addons__bag').show();
                            $('.nav-addons .shop-bag-bnt').show();
                            $('.nav-addons__link.nav-addons__search').removeClass('search-close-v5-style');
                        }
                    }
                    _this.removeUnScroll();
                    _this.enableScroll();
                    _this.closeAllPopups();
                }
                if (_this.$mainNav.hasClass(_this.mainNavOpenedClass)) {
                    _this.$mainNav.removeClass(_this.mainNavOpenedClass);
                    _this.$mainNav.find(_this.mainNavItem).removeClass(_this.mainNavItemVisibleClass);
                    _this.$navToggle.removeClass(_this.navToggleActiveClass);
                    _this.$navToggle.attr("aria-expanded",false);
                }
                if (window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')) {//close login
                    if(_this.$loginV4.hasClass(_this.$loginV4OpenedClass)){
                        $(_this.$loginV4).removeClass(_this.$loginV4OpenedClass);
                        $(_this.$loginV4).attr("aria-expanded",false);
                    }
                }
            }
        },
        bindHaExposure: function(){
            const isEcSite = window.isECommerceSite !== 'None';
            let $headerEl = $('.v4.header');

            isEcSite && Mkt.Util.elVisibleHandler($headerEl.toArray(), null, (ele) => {

                Mkt.Util.pushHaPoint("120200011", "Home_Navigation_Header_Exposure", {
                    "componentry_name":"Home_Navigation_Header",
                    "componentry_title": "",
                    "etype": "exposure",
                });

            });
        },
        bindHaListener: function(){
            const isEcSite = window.isECommerceSite !== 'None';

            let navHaObj = {
                "componentry_name": "Home_Navigation_Header",
                "componentry_title": "",
                "card_title": '', //$按钮文本
                "button_name": '', //$按钮文本--搜索图标传search,登入传login，登出传logout,购物车传cart,其余传配置的文本
                "etype": "click",
            }

            $('.main-nav__list li.main-nav__item a').on('click', function () {
                let $configText = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || ''
                let cardTitle = $(this).hasClass('main-nav__link')?'top_navigation':'primary_navigation';
                navHaObj.card_title = cardTitle;
                navHaObj.button_name = $configText;
                isEcSite && Mkt.Util.pushHaPoint("110200011","Home_Navigation_Header_Click",navHaObj)
            })

            $('.v4.header .login-v4-cnt a').not('[act="Click on sign in"], [act="Click on exit"]').on('click', function () {
                let $configText = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || ''
                navHaObj.card_title = $configText;
                navHaObj.button_name = $configText;
                isEcSite && Mkt.Util.pushHaPoint("110200011","Home_Navigation_Header_Click",navHaObj)
            })

            // 搜索图标传search
            $('.v4.header .js-open-search').on('click', function() {
                if($(this).hasClass('search-close-v5-style')){
                    return;
                }
                navHaObj.card_title = 'search';
                navHaObj.button_name = 'search';
                isEcSite && Mkt.Util.pushHaPoint("110200011","Home_Navigation_Header_Click",navHaObj)
            })

            // 登入login
            $('.v4.header .login-v4-cnt  a[act="Click on sign in"]').on('click', function () {
                navHaObj.card_title = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || '';
                navHaObj.button_name = 'login';
                isEcSite && Mkt.Util.pushHaPoint("110200011","Home_Navigation_Header_Click",navHaObj)
            })

            // 登出 logout
            $('.v4.header .login-v4-cnt a[act="Click on exit"]').on('click', function () {
                navHaObj.card_title = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || '';
                navHaObj.button_name = 'logout';
                isEcSite && Mkt.Util.pushHaPoint("110200011","Home_Navigation_Header_Click",navHaObj)
            })

            //购物车传cart
            $('.v4.header .shop-bag.shop-bag-bnt').on('click', ()=> {
                navHaObj.card_title = 'cart';
                navHaObj.button_name = 'cart';
                isEcSite && Mkt.Util.pushHaPoint("110200011","Home_Navigation_Header_Click",navHaObj)
            })


        },
        handleSubmenuPopupClose: function(){
            setTimeout(()=>{
                $('.v5-style .nav-submenu-item.open').removeClass('open').fadeOut(0);
                $('.v5-style .main-nav__item .main-nav__link').removeClass('fade-out');
                $('.v5-style .main-nav .login-v4-cnt li a').removeClass('fade-out');
                $('.main-nav-wrap .login-v4-wrap.nav-addons__link').removeClass('not-touch');
                $('.v4.header.v5-style').removeClass('submenu-open');
                $('.main-nav-wrap .nav-zone').removeClass('not-touch');
                $('.main-nav .main-nav-wrap').removeClass('not-scroll');
            },250)
            $('.v5-style .nav-menuback-button').hide();
        },
        handleSubmenuPopupPc: function(){
            let _this = this;

            if(!this.isV5Version || window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                $('.v5-style .main-nav__item').off('mouseenter');
                $('.v5-style .main-nav__item').off('mouseleave');
                return;
            }

            let headerNavHeight = $('.v4.header.v5-style').height();
            $('.v5-style .nav-submenu-content').each(function(){
                let submenuHeight = $(this).outerHeight(true);
                $(this).parents('.nav-submenu-item').attr("style", "--submenuHeight: " + submenuHeight + "px;");
            })

            const $mainNavItem = $('.v5-style .main-nav__item');
            $mainNavItem.each(function() {
                const $menuItem = $(this);

                // 鼠标进入 menu-item 显示 box
                $menuItem.on('mouseenter',  ()=> {
                    if($menuItem.find('.nav-submenu-scroll').length<1){
                        return;
                    }
                    $menuItem.find('.nav-submenu-item').show();
                    // 鼠标移入,添加显示类名
                    $menuItem.addClass('hover');
                    $(_this.searchPopup).hide();
                    $(_this.popup).removeClass(_this.popupVisibleClass);
                    $(".js-open-search").attr("aria-expanded",false);
                    $(".login-v4-wrap,.js-nav-toggle,.shop-bag-bnt,.logo").attr("tabindex",0);
                    _this.openedSearch = false;
                    _this.removeUnScroll();
                    _this.enableScroll();
                    _this.closeAllPopups();
                    $('.header.v5-style .shop-cart-popup-ec').stop().hide().removeClass('open');
                    // 添加显示类名后,记录上一次的高度:historyNavHeight
                    setTimeout(()=>{
                        let menuItemHeight = $menuItem.find('.nav-submenu-item').height();
                        $(".main-navigation__container").attr("style", "--historyNavHeight: " + menuItemHeight + "px;");
                    },250)

                    setTimeout(() => {
                        $(_this.header).removeClass(_this.popupOpenedClass);
                        $(_this.header).addClass('nav-submenu-popup-opened');
                    }, 150);
                });

                // 鼠标离开 menu-item 设置延迟隐藏
                $menuItem.on('mouseleave',  ()=> {
                    if($menuItem.find('.nav-submenu-scroll').length<1){
                        return;
                    }

                    setTimeout(()=>{
                        // 鼠标移出,移除显示类名
                        $menuItem.removeClass('hover');

                        if(!$('.v5-style .main-nav__item.hover').length){
                            // 移除显示类名后,historyNavHeight高度变为0
                            $(".main-navigation__container").attr("style", "--historyNavHeight: " + 0 + "px;");
                            $menuItem.addClass('hover-out');
                            $menuItem.find('.nav-submenu-item').stop().animate({height:0},250,()=>{
                                $menuItem.find('.nav-submenu-item').css('height','');
                                $menuItem.removeClass('hover-out');
                            });
                        }
                    })

                    setTimeout(() => {
                        $(_this.header).removeClass('nav-submenu-popup-opened');
                    }, 150);

                });


            });

            if(window.innerWidth >= _this.uiBoundaryVal && !_this.$headerNav.hasClass('mb-ui')){
                $(window).on('scroll', ()=> {
                    let $navItemHover = $('.v5-style .main-nav__item.hover');
                    if($navItemHover.length){
                        $navItemHover.trigger('mouseleave');
                        $navItemHover.blur();
                        setTimeout(()=>{
                            $('.v5-style .main-nav__item').find('.nav-submenu-item').hide();
                        },250)

                        $(_this.header).removeClass('nav-submenu-popup-opened');
                    }

                });
            }

        },
        handleSubmenuPopupMob: function(){
            let _this = this;
            let isBreadcrumbNav = (window.innerWidth < _this.uiBoundaryVal) || _this.$headerNav.hasClass('mb-ui');
            if(!isBreadcrumbNav || !this.isV5Version){
                $('.v5-style .main-nav__item .main-nav__link').off('click');
                return;
            }
            if(isBreadcrumbNav && this.isV5Version){

                const $mainNavItem = $('.v5-style .main-nav__item');
                $mainNavItem.each(function() {
                    if($(this).find('.nav-submenu-scroll').length > 0){
                        $(this).find('.main-nav__link').removeAttr("href");
                    }
                })

                const $mainNavLink = $('.v5-style .main-nav__item .main-nav__link');
                $mainNavLink.on('click', function (e) {
                    if($(this).parents('.main-nav__item').find('.nav-submenu-scroll').length < 1){
                        return;
                    }
                    e.preventDefault();
                    $mainNavLink.addClass('fade-out');
                    $('.v5-style .main-nav .login-v4-cnt li a').addClass('fade-out');
                    $('.v4.header.v5-style').addClass('submenu-open');
                    setTimeout(()=>{
                        $('.main-nav-wrap .login-v4-wrap.nav-addons__link').addClass('not-touch');
                        $(this).parents('.nav-zone').siblings('.nav-zone').addClass('not-touch');
                    },150)
                    $(this).parents('.main-nav__item').find('.nav-submenu-item').fadeIn(200,function(){
                        $(this).parents('.main-nav__item').find('.nav-submenu-item').addClass('open');
                    });
                    $('.v5-style .nav-menuback-button').fadeIn(200);
                    $('.main-nav .main-nav-wrap').addClass('not-scroll');
                });

                $('.v5-style .nav-menuback-button').on('click',function(){
                    $('.v5-style .nav-submenu-item.open').fadeOut(50,()=>{
                        $('.v5-style .nav-submenu-item.open').removeClass('open');
                    });
                    $('.main-nav .main-nav-wrap').removeClass('not-scroll');
                    setTimeout(()=>{
                        $mainNavLink.removeClass('fade-out');
                        $('.v5-style .main-nav .login-v4-cnt li a').removeClass('fade-out');
                    })
                    $('.main-nav-wrap .login-v4-wrap.nav-addons__link').removeClass('not-touch');
                    $('.v4.header.v5-style').removeClass('submenu-open');
                    $('.main-nav-wrap .nav-zone').removeClass('not-touch');
                    $(this).fadeOut(200);
                })

            }

        },
        handleResizeClickHoverToggle: function(){
            let _this = this;
            let isBreadcrumbNav = (window.innerWidth < _this.uiBoundaryVal) || _this.$headerNav.hasClass('mb-ui');
            if(!isBreadcrumbNav){
                $('.v5-style .main-nav .main-nav-wrap').removeAttr('style');
                $('.v5-style .n04-platform-selection.platform-selection.nav-v2').removeAttr('style');
                $('.v5-style .nav-addons .login-v4-wrap.Fusion-eCommerce, .v5-style .nav-addons .login-v4-wrap.Self-eCommerce').removeAttr('style');
            }else{
            }
        },
        bindSubmenuItemGa: function () {
            if(this.isV5Version){
                let $pageCategory = window.digitalData ? window.digitalData.page.category.pageType : '';
                if($pageCategory === 'press'){
                    $pageCategory = 'news';
                }
                $('.header.v5-style .nav-submenu-item').on("click", "a", function () {
                    let $iconName = $(this).text().replace(/<[^>]*>/g, '').trim() || '';
                    let submenuItemGaObj = {
                        event: "second_navigation_click",
                        pageCategory: $pageCategory,
                        iconName: $iconName,
                    };
                    window.dataLayer.push(submenuItemGaObj);
                });
            }
        },
        handleShopCartClick: function(){

            let isEcSite = window.isECommerceSite && window.isECommerceSite !== "None";
            let $shopCartPopupEc = $('.header.v5-style .shop-cart-popup-ec');
            let navShopCartSwitch = !!$shopCartPopupEc.length;
            let $navEcShopCart = $('.v5-style .nav-addons .nav-addons__link.shop-bag-bnt');
            let _this = this;

            if(!isEcSite || !navShopCartSwitch) return; //navShopCartSwitch 一级导航购物车弹窗开关

            $navEcShopCart.off("click"); // 移除电商 点击事件

            $(window).on('load',  ()=> {

                $navEcShopCart.on("click", () => {
                    if ($shopCartPopupEc.hasClass('open')) {

                        handleMainNavigation.removeUnScroll();
                        handleMainNavigation.enableScroll();
                        $(handleMainNavigation.header).removeClass(handleMainNavigation.popupOpenedClass);
                        $shopCartPopupEc.removeClass('open');
                        if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                            $('.main-navigation__container .logo').removeClass('hide');
                            $('.nav-addons__link.nav-addons__search').show();
                            let navLoginWrap = $('.nav-addons .nav-addons__link.login-v4-wrap');
                            if(!navLoginWrap.hasClass('Fusion-eCommerce') && !navLoginWrap.hasClass('Self-eCommerce')){
                                navLoginWrap.show();
                            }
                            $('.nav-toggle.js-nav-toggle').show();
                            $('.nav-addons__link.nv-addons__bag').removeClass('shop-cart-nav-close');
                        }
                        handleMainNavigation.handleShopCartPopup(false);

                    } else {
                        $shopCartPopupEc.removeAttr('style');
                        handleMainNavigation.unScroll();
                        handleMainNavigation.disableScroll();
                        $(handleMainNavigation.header).addClass(handleMainNavigation.popupOpenedClass);
                        handleMainNavigation.openedSearch = false;
                        $(handleMainNavigation.searchPopup).stop().slideUp(0);
                        $shopCartPopupEc.addClass('open');
                        if(window.innerWidth < _this.uiBoundaryVal || _this.$headerNav.hasClass('mb-ui')){
                            $('.main-navigation__container .logo').addClass('hide');
                            $('.nav-addons__link.nav-addons__search').hide();
                            $('.nav-addons .nav-addons__link.login-v4-wrap').hide();
                            $('.nav-toggle.js-nav-toggle').hide();
                            $('.nav-addons__link.nv-addons__bag').addClass('shop-cart-nav-close');
                        }
                        handleMainNavigation.handleShopCartPopup(true);

                    }
                });

            });
        },
        handleShopCartPopup: function (show) {

            let $shopCartPopupEc = $('.header.v5-style .shop-cart-popup-ec');

            if(!$shopCartPopupEc) return;

            if(show){

                return (
                    $shopCartPopupEc.stop().slideDown(300,()=>{
                        let shopCartPopupHeight = $shopCartPopupEc.height();
                        $(".main-navigation__container").attr("style", "--historyNavHeight: " + shopCartPopupHeight + "px;");
                    })
                )
            }else{
                return (
                    $shopCartPopupEc.stop().slideUp(300,()=>{
                        $(".main-navigation__container").attr("style", "--historyNavHeight: 0px;");
                    })
                )
            }

        },
    };

    var handleSecondTabs = {
        $secondEle: $('#second-navigation-v4'),
        dropDownBtn: '#second-navigation-v4 .drop-down__btn',
        overviewBtn: '.second-navigation-new-version .product-tabs_overview__btn',
        buyBtn: '#second-nav-buy-button',
        product: null,
        secNavItem: null,
        secNavItemDropDown: null,
        pageType: window.digitalData.page.category.pageType,
        isV5Version:$('.header').hasClass('v5-style'),
        $secondEleWhiteBg: $('.second-nav-white-background'),
        init: function () {
            if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
                if (siteCode === "en") {
                    this.$secondEle.hide();
                    return;
                }
            }
            var _this = this;
            if (this.$secondEle.length) {
                this.bindNavToggle();
                this.initBuyButton();
                this.focusOnActive();
                this.bindGAListener();
                this.bindHAListener();
                this.bindNavDropdownToggle();
                if($('.v4.second-navigation-v5-style').length > 0){
                    this.bindDropDownClickNewNavV5();
                    this.bindOverviewClickNewNavV5();
                    this.handleSecondNavPopupClick();
                    this.bindOverviewSupportDropdownToggleNewNav();
                    this.handleScrollNewNav();
                }else if($('.v4.second-navigation-v4-new').length > 0){
                    this.bindDropDownClickNewNav();
                    this.bindOverviewClickNewNav();
                    this.bindOverviewSupportDropdownToggleNewNav();
                    this.handleScrollNewNav();
                }else{
                    this.bindDropDownClick();
                }
                $(window).resize(function () {
                    _this.setDropdownPosition();
                })
            }

        },
        isNeedHATrigger: function(){
            // 电商站点，产品页/specs页
            let isEcSite = window.isECommerceSite !== 'None';
            let $pageCategory = window.digitalData ? window.digitalData.page.category.pageType : '';
            let productDetailPage = $pageCategory === 'product-detail';
            let productDetailSpecs = $pageCategory === 'product-detail_specs';
            let haTrigger = isEcSite && (productDetailPage || productDetailSpecs);
            return haTrigger;
        },
        bindHAListener: function(){
            // Seconded Navigation Component
            let $secondNavDom = $('#second-navigation-v4');

            handleSecondTabs.isNeedHATrigger() &&
            Mkt.Util.elVisibleHandler($secondNavDom.toArray(), null, (ele) => {

                Mkt.Util.pushHaPoint('120200055', 'Seconded_Navigation_Component_Exposure', {
                    "componentry_name":"Seconded_Navigation_Component",
                    "componentry_title": "",
                    "etype": "exposure",
                });

            });

            let secondNavActiveTitle =  handleSecondTabs.$secondEle.find(".product-link__active").data("title")||'';
            let secondNavHAObj = {
                "componentry_name": "Seconded_Navigation_Component",
                "componentry_title": "",
                "card_title": secondNavActiveTitle, //$商品名称
                "button_name": '', //按钮文本
                "etype": "click"
            }

            // feature spec productSupport for ha
            let $productTabLink = $('#second-navigation-v4 .product-tabs__links-item a[href]').not('.product-tabs__link--active');
            $productTabLink.on('click', function () {
                let mainTitle = $(this).attr('ha-title') || $(this).attr("title") || $(this).data("title") ||'';
                secondNavHAObj.button_name = mainTitle;
                handleSecondTabs.isNeedHATrigger() &&
                Mkt.Util.pushHaPoint("110200055","Seconded_Navigation_Component_Click",secondNavHAObj)
            })

            // buy botton for ga
            $(document).on('click','#second-navigation-v4 .product-tabs__button',  function() {
                secondNavHAObj.button_name = $(this).attr("title") || 'buy';
                handleSecondTabs.isNeedHATrigger() &&
                Mkt.Util.pushHaPoint("110200055","Seconded_Navigation_Component_Click",secondNavHAObj)
            })

        },
        bindGAListener: function () {
            var _this = this;
            this.$secondEle.find(".relate-product").on("click", function (e) {
                let relateProductTitle = $(this).attr("title")||$(this).data("title")||'';
                window.dataLayer.push({
                    clickName: "sub header navi_click to " + relateProductTitle,
                    clickType: "action",
                    event: "subHeaderNaviClick",
                    pageCategory: _this.pageType,
                    productMktName: _this.$secondEle.find(".product-link__active").data("title")||'',
                    buttonName: relateProductTitle
                });
                // relate product for ha
                handleSecondTabs.isNeedHATrigger() &&
                Mkt.Util.pushHaPoint("110200055","Seconded_Navigation_Component_Click",{
                    "componentry_name": "Seconded_Navigation_Component",
                    "componentry_title": "",
                    "card_title": relateProductTitle, //$商品名称
                    "button_name": relateProductTitle, //按钮文本
                    "etype": "click"
                })
            })
            $('#second-navigation-v4.second-navigation-v5-style').find(".ga-for-product-link").on("click", ()=> {
                let activeTitle =  _this.$secondEle.find(".product-link__active").data("title")||''
                window.dataLayer.push({
                    clickName: "sub header navi_click to " + activeTitle,
                    clickType: "action",
                    event: "subHeaderNaviClick",
                    pageCategory: _this.pageType||'',
                    productMktName: activeTitle,
                    buttonName: activeTitle
                });
                // main product for ha
                handleSecondTabs.isNeedHATrigger() &&
                Mkt.Util.pushHaPoint("110200055","Seconded_Navigation_Component_Click",{
                    "componentry_name": "Seconded_Navigation_Component",
                    "componentry_title": "",
                    "card_title": activeTitle, //$商品名称
                    "button_name": activeTitle, //按钮文本
                    "etype": "click"
                })
            })
            this.$secondEle.find(".dropdown-link").on("click", function (e) {
                window.dataLayer.push({
                    clickName: "sub header_click to " + $(this).closest(".sec-nav-item-dropDown").data("parent") + "_" + $(this).attr("title"),
                    clickType: "action",
                    event: "subHeaderNaviSupportChildMenu",
                    subheaderSection: "support page",
                    pageCategory: _this.pageType,
                    productMktName: _this.$secondEle.find(".product-link__active").data("title"),
                    buttonName: $(this).closest(".sec-nav-item-dropDown").data("parent"),
                    subButtonName: $(this).attr("title")
                });
            })
        },
        setDropdownPosition: function () {
            // 分辨率大于991时，通过js调整下拉菜单位置
            if (!this.secNavItem && !this.secNavItemDropDown) {
                return;
            }
            var position = this.secNavItem.offset();
            var leftVal = position.left - (this.secNavItemDropDown.innerWidth() - this.secNavItem.innerWidth()) / 2;
            if(window.innerWidth > 991.98 && window.innerWidth < 1599.98){
                leftVal = leftVal - 40; // 992-1600 页面左右间距 由80-40，固需要减去40px;
            }
            var topPosition = $('#second-navigation-v4').height();
            if (window.innerWidth > 991.98) {
                this.secNavItemDropDown.offset({left: leftVal});
            } else {
                this.secNavItemDropDown.offset({left: 0});
            }
        },
        bindNavDropdownToggle: function () {
            var _this = this;
            $(document).on('click', '.product-tabs__links-item.with-drop-down-config', function () {
                _this.secNavItem = $(this);
                var relateAtt = _this.secNavItem.find('a').attr('data-index');
                _this.secNavItemDropDown = $('[data-relate="' + relateAtt + '"]');
                _this.setDropdownPosition();
                if (_this.pageType === 'support') {
                    (!_this.secNavItemDropDown.hasClass('dif-padding')) && _this.secNavItemDropDown.addClass('dif-padding');
                }
                _this.secNavItemDropDown.slideToggle(700);
                _this.secNavItem.toggleClass('unfold-status');
                _this.secNavItem.children('i').toggleClass('reverse');
                var dom = $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap");
                if (dom.length > 0 && dom.hasClass('open')) {
                    dom.removeClass('open');
                    $('#second-navigation-v4 .drop-down__wrap').slideUp(700);
                }

            });
            $(document).on("click", function (e) {
                var target = $(e.target);
                if (target.closest(".with-drop-down-config").length == 0) {
                    $('.sec-nav-item-arrow-icon').removeClass('reverse');
                    _this.secNavItem && _this.secNavItem.removeClass('unfold-status');
                    _this.secNavItemDropDown && _this.secNavItemDropDown.slideUp(700);
                }
            });
        },
        focusOnActive: function () {
            var $activeElement = $('#second-navigation-v4 .product-tabs__link--active');
            if ($activeElement.length) {
                var containerWidth = $activeElement.parents().eq(2).width();
                var leftPosition = $activeElement.parent().position().left;
                var elementWidth = $activeElement.parent().width();
                if (leftPosition < 0) {
                    $activeElement.parents().eq(2).animate({scrollLeft: leftPosition}, 400);
                }
                if (leftPosition >= 0 && containerWidth < leftPosition + elementWidth) {
                    $activeElement.parents().eq(2).animate({scrollLeft: leftPosition}, 400);
                }

            }

        },
        initBuyButton: function () {
            var $buyBtn = $(this.buyBtn);
            if ($buyBtn.length == 0) {
                return;
            }
            var productJson = $("#second-navigation-v4").find("#buy-wrap input[name='productJson']").val();
            var showStoreFinder = $("#second-navigation-v4").find("#buy-wrap input[name='showStoreFinder']").val() == 'true';
            var storeFinderLink = $("#second-navigation-v4").find("#buy-wrap input[name='storeFinderLink']").val();
            var openStoreFinderInNewPage = $("#second-navigation-v4").find("#buy-wrap input[name='openStoreFinderInNewPage']").val();
            var disclaimer = $("#second-navigation-v4").find("#buy-wrap input[name='disclaimer']").val();
            var enablePdpFusion = $("#second-navigation-v4").find("#buy-wrap input[name='enablePdpFusion']").val() == "true";
            this.product = JSON.parse(productJson);
            var adminEcBuyLink = this.product.ecBuyLink;
            buyBtnAttributes(this.product, this.product.marketingName, 'second_top', 'product-detail');

            for (var name in this.product.buyButtonAttr) {
                $buyBtn.attr(name, this.product.buyButtonAttr[name]);
            }

            // 电商站点或cn站点时，按钮文字以及显示隐藏处理
            this.handleProductSecondNavBuyButtonForSite($buyBtn);
            $buyBtn.on("click", function () {
                if ((window.integrationJsInterface || window.integrationJsInterfaceWebview) && enablePdpFusion) {
                    // App webview开启fusion eCommerce(10月RU App上线融合电商，Web don't)
                    if (adminEcBuyLink.indexOf("/content/huawei-cbg-site") > -1) {
                        adminEcBuyLink = adminEcBuyLink.split("/content/huawei-cbg-site")[1];
                    }
                    if (String(window.isECommerceSite) !== "None") {
                        adminEcBuyLink = dialogLinkHandler(adminEcBuyLink);
                    }
                    window.open(adminEcBuyLink, '_self');
                } else {
                    var pname = $(this).attr('data-pname') || '';
                    var storeFinder = {
                        showStoreFinder: showStoreFinder,
                        openStoreFinderInNewPage: openStoreFinderInNewPage,
                        storeFinderLink: storeFinderLink
                    };
                    buyFeature($(this), storeFinder, disclaimer, pname);

                    // pdp-dmpa
                    dmpaCommon("trackEvent", "click", "product details interaction", getChapter2(), $(this).attr('data-btnlinkinfo'));
                }
            });
        },
        handleProductSecondNavBuyButtonForSite: function ($btn) {
            if (!$btn || $btn.length == 0) {
                return;
            }
            var eCommerceSiteFlag = isECommerceSite && isECommerceSite != 'None';
            var siteCodeValue = window.digitalData.page.pageInfo.siteCode || '';
            var productId = $btn.attr('data-ecproductid') || "";
            if (siteCodeValue === "cn") {
                var enableVmallbtn = $btn.data("vmallbtn") || false;
                if (enableVmallbtn) {
                    setBuyButtonTextBySbomListForCn(productId.trim(), $btn);
                }
            } else if (eCommerceSiteFlag) {
                //设置buy 按钮文字
                var text = ecCom.I18n.get("ec_buy");
                $btn.html(text).attr("title", text);
                if (digitalData.page.category.pageType != 'product-detail_buy') {
                    var ecAdminSetting = $btn.data('ecadminsetting') || false;
                    var ecProductInfo = currentPageMinPriceAndInvMap.get(productId.trim()) || {};
                    handleBuyButtonTextForECommerceSite(ecAdminSetting, true, ecProductInfo, $btn);
                } else {
                    // 接口未返回数据，或产品未开启电商配置时，不显示购买按钮
                    $btn.remove();
                }
            }
        },
        bindDropDownClick: function () {
            var _this = this;
            if ($(_this.dropDownBtn).length) {
                $(document).on('click', _this.dropDownBtn, function () {
                    $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap").toggleClass("open");
                    $('#second-navigation-v4 .drop-down__wrap').slideToggle(700);
                    handleSecondTabs.dropDownButtonGa();
                });
            }
        },
        handleSecondNavV5Open: function(flag) {
            if(flag === true){
                $("#second-navigation-v4.second-navigation-v5-style").addClass("open");
            }else{
                $("#second-navigation-v4.second-navigation-v5-style").removeClass("open");
            }
        },
        dropDownButtonGa: function(){
            let _this = this;
            // ga
            window.dataLayer.push({
                clickName: "sub header navi_click drop down button",
                clickType: "action",
                event: "subHeaderNaviDropDown",
                pageCategory: _this.pageType||'',
                productMktName: _this.$secondEle.find(".product-link__active").data("title")||'',
                buttonName: "drop down button"
            });
            // drop down button ha
            handleSecondTabs.isNeedHATrigger() &&
            Mkt.Util.pushHaPoint("110200055","Seconded_Navigation_Component_Click",{
                "componentry_name": "Seconded_Navigation_Component",
                "componentry_title": "",
                "card_title": _this.$secondEle.find(".product-link__active").data("title")||'', //$商品名称
                "button_name": "drop down button", //按钮文本
                "etype": "click"
            })
        },
        bindDropDownClickNewNav: function(){
            let _this = this;
            if ($(_this.dropDownBtn).length) {
                var that = _this;
                $(document).on('click', _this.dropDownBtn, function () {
                    if(window.innerWidth < 991.98) {
                        if(!$(this).hasClass('open')){
                            $("#second-navigation-v4 .product-tabs_overview").fadeOut(300,()=>{
                                $("#second-navigation-v4 .product-tabs__heading").addClass("open");
                                $('#second-navigation-v4 .product-tabs_overview').addClass("opacity");
                            });
                        }else{
                            $("#second-navigation-v4 .product-tabs_overview").fadeIn(0,()=>{
                                $('#second-navigation-v4 .product-tabs_overview').removeClass("opacity");
                                $("#second-navigation-v4 .product-tabs__heading").removeClass("open");
                            })
                        }
                    }
                    $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap").toggleClass("open");
                    $('#second-navigation-v4 .drop-down__wrap').slideToggle(300);
                    handleSecondTabs.dropDownButtonGa();
                });
            }
        },
        bindDropDownClickNewNavV5: function(){
            let _this = this;
            if (!$(_this.dropDownBtn).length) {
                return;
            }
            $(document).on('click', _this.dropDownBtn, function () {
                $('#second-navigation-v4 .drop-down__wrap').stop(true, true);
                if(!$(this).hasClass('open')){
                    $('#second-navigation-v4 .overview-drop-down__wrap').slideUp(300,()=>{
                        $('#second-navigation-v4 .drop-down__wrap').slideDown(350);
                    });
                    handleSecondTabs.handleSecondNavV5Open(true);
                    $("#second-navigation-v4 .product-tabs_overview__btn,#second-navigation-v4 .overview-drop-down__wrap").removeClass("open");
                }else{
                    $('#second-navigation-v4 .drop-down__wrap').slideUp(350,()=>{
                        handleSecondTabs.handleSecondNavV5Open();
                    });
                }
                $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap").toggleClass("open");
                handleSecondTabs.dropDownButtonGa();
            });
        },
        bindOverviewClickNewNav: function() {
            let _this = this;
            $(document).on('click', _this.overviewBtn, function () {
                if(!$(this).hasClass('open')){
                    $("#second-navigation-v4 .n06-js-down-btn").fadeOut(300);
                }else{
                    $("#second-navigation-v4 .n06-js-down-btn").fadeIn(300);
                }
                $("#second-navigation-v4 .product-tabs_overview__btn,#second-navigation-v4 .overview-drop-down__wrap").toggleClass("open");
                $('#second-navigation-v4 .overview-drop-down__wrap').slideToggle(350);
                handleSecondTabs.dropDownButtonGa();
            })
        },
        bindOverviewClickNewNavV5: function() {
            let _this = this;
            $(document).on('click', _this.overviewBtn, function () {
                $('#second-navigation-v4 .overview-drop-down__wrap').stop(true, true);
                if(!$(this).hasClass('open')){
                    $('#second-navigation-v4 .drop-down__wrap').slideUp(300,()=>{
                        $('#second-navigation-v4 .overview-drop-down__wrap').slideDown(350);
                    });
                    handleSecondTabs.handleSecondNavV5Open(true);
                    $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap").removeClass("open");
                }else{
                    $('#second-navigation-v4 .overview-drop-down__wrap').slideUp(350,()=>{
                        handleSecondTabs.handleSecondNavV5Open();
                    });
                }
                $("#second-navigation-v4 .product-tabs_overview__btn,#second-navigation-v4 .overview-drop-down__wrap").toggleClass("open");
                handleSecondTabs.dropDownButtonGa();
            })
        },
        bindOverviewSupportDropdownToggleNewNav: function() {
            $(".sec-server-surpport-item.overview-product-tabs__link").click(function() {
                $(this).toggleClass("overview-product-tabs__link--active");
                $('.overview-product-tabs__links-item .overview-sec-nav-item-arrow-icon').toggleClass('reverse');
                // 0.7秒过渡动画
                $('.overview-sec-nav-item-dropDown').slideToggle(700);
            })
            $(".overview-sec-nav-item-arrow-icon").click(function() {
                $('.sec-server-surpport-item.overview-product-tabs__link').toggleClass("overview-product-tabs__link--active");
                $(this).toggleClass('reverse');
                // 0.7秒过渡动画
                $('.overview-sec-nav-item-dropDown').slideToggle(700);
            })
        },
        handleSecondNavPopupClick: function(){
            $("body").on("click" , (event)=> {
                let $target = $(event.target);
                let isSelfV5Style = $target.hasClass("second-navigation-v5-style");
                let isParentV5Style = $target.closest(".second-navigation-v5-style").length > 0;
                if(!isParentV5Style && !isSelfV5Style && window.innerWidth>1079.98){
                    closeSecondNavPopupV5();
                }
                if(!$target.hasClass("second-navigation-v5-style")||window.innerWidth>1080.98) {
                    return;
                }else {
                    closeSecondNavPopupV5();
                }
            })
                function closeSecondNavPopupV5(){
                    $('#second-navigation-v4 .drop-down__wrap').slideUp(350);
                    $('#second-navigation-v4 .overview-drop-down__wrap').slideUp(350);
                    setTimeout(()=>{
                        handleSecondTabs.handleSecondNavV5Open();
                    },350)
                    $("#second-navigation-v4 .product-tabs_overview__btn,#second-navigation-v4 .overview-drop-down__wrap").removeClass("open");
                    $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap").removeClass("open");
                }
        },
        bindNavToggle: function () {
            var headerNav = document.getElementById('header-v4');
            var headerPl = document.getElementById('header-placeholder');
            var secondNav = document.getElementById('second-navigation-v4');
            var userAgent = navigator.userAgent;
            var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1;
            var isIE11 = !!window.ActiveXObject ? !!window.ActiveXObject : "ActiveXObject" in window;
            var isEdge = userAgent.indexOf("Edge") > -1;
            if (secondNav && headerNav) {
                if ($('.mkt-ad-banner').length > 0) {
                    $('.mkt-ad-banner').after(secondNav);
                } else {
                    $('#header-v4').after(secondNav);
                }
                if (!(Granite && Granite.author)) {
                    headerNav.classList.add('minisite-nav');
                    handleMainNavigation.pageTypeNavFlag = true
                }
                var positionStickySupport = (function () {
                    var el = document.createElement('a'),
                        mStyle = el.style;
                    mStyle.cssText = 'position:sticky;position:-webkit-sticky';
                    return mStyle.position.indexOf('sticky') !== -1;
                })();

                if (positionStickySupport == false || isIE || isIE11 || isEdge) {
                    document.body.classList.add('no-sticky');
                    var v4navProductPosition = headerNav.clientHeight;
                    if (isEdge) {
                        secondNav.classList.add('isEdge');
                    }
                    window.onscroll = function () {
                        if (window.pageYOffset > v4navProductPosition) {
                            headerPl.style.paddingTop = secondNav.clientHeight + 'px';
                            secondNav.classList.add('stuck');
                        } else {
                            secondNav.classList.remove('stuck');
                            headerPl.style.paddingTop = 0;
                        }
                    };
                    window.onresize = function () {
                        v4navProductPosition = headerNav.clientHeight;
                    };
                }
            }
        },
        handleScrollNewNav: function(){
            let _this = this;
            let eventList = handleSecondTabs.isV5Version&&window.innerWidth<1080? ['wheel', 'mousewheel', 'touchmove']:['scroll'];
            let $secNav = $('.v4.n06-second-navigation');
            let isV5VersionMediaScreen = $secNav.hasClass('second-navigation-v5-style')?767.98:991.98;
            let isEnableSecondNavTheme = $secNav.hasClass('theme-nav-enable');
            eventList.forEach(eventType => {
            window.addEventListener(eventType,  ()=> {
                var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                let isV5VersionOpen = $secNav.hasClass('second-navigation-v5-style')?$("#second-navigation-v4.second-navigation-v5-style").hasClass("open"):true;
                if (scrollTop > 1 && isV5VersionOpen) {
                    setTimeout(()=>{
                        handleSecondTabs.handleSecondPopupCloseV5();
                    })
                    $("#second-navigation-v4 .n06-js-down-btn").fadeIn(0);
                    $('.n06-second-navigation .sec-nav-item-dropDown').slideUp(350);
                    $('.product-tabs__links-item.with-drop-down-config').removeClass('unfold-status');
                    $('.product-tabs__links-item.with-drop-down-config').children('i').removeClass('reverse');
                    $("#second-navigation-v4 .product-tabs__heading").removeClass("open");
                    if(window.innerWidth < isV5VersionMediaScreen) {
                        $("#second-navigation-v4 .product-tabs_overview").fadeIn(0).removeClass("opacity");
                    }
                }
            });
            window.addEventListener('scroll',  ()=> {
                let handleIntersecting = handleSecondTabs.handleScopedElements();
                isEnableSecondNavTheme && handleIntersecting(true);
            });
            });
        },
        handleSecondPopupCloseV5: function(){
            $("#second-navigation-v4 .drop-down__btn,#second-navigation-v4 .drop-down__wrap").removeClass("open");
            $("#second-navigation-v4 .product-tabs_overview__btn,#second-navigation-v4 .overview-drop-down__wrap").removeClass("open");
            setTimeout(()=>{
                handleSecondTabs.handleSecondNavV5Open();
            }, 350)
            $('#second-navigation-v4 .drop-down__wrap').slideUp(350);
            $('#second-navigation-v4 .overview-drop-down__wrap').slideUp(350);
        },
        handleScopedElements: function() {
            let allMiniSiteElements = Array.from(document.querySelectorAll('[data-mkt-secondNav-bgColor]'));

            let cloneArr = [...allMiniSiteElements.filter((el) => {
                return ['white', 'black'].includes((el.dataset.mktSecondnavBgcolor || '').trim());
            })].reverse();
            let secondNavEl = document.querySelector('.second-navigation-v5-style');
            if(!secondNavEl) return;
            let navRect = secondNavEl.getBoundingClientRect();


            function calcIntersect(navRect, eleRect) {
                return !(navRect.left > eleRect.right || navRect.right < eleRect.left || navRect.top > eleRect.bottom || navRect.bottom < eleRect.top);
            }

            return (isTriggerByResizeEv) => {
                let isTriggerByResizeEvent = typeof isTriggerByResizeEv === 'boolean' ? isTriggerByResizeEv : false;
                let res = cloneArr.some((ele) => {
                    let eleRect = ele.getBoundingClientRect();

                    if (isTriggerByResizeEvent) {
                        navRect = secondNavEl.getBoundingClientRect();
                    }

                    let isIntersecting = calcIntersect(navRect, eleRect);

                    if (isIntersecting) {
                        let changeClass = (ele.dataset.mktSecondnavBgcolor || '').trim();
                        let originClass = Array.from(secondNavEl.classList).find(cls =>
                            cls.startsWith('second-nav-')
                        );
                        secondNavEl.classList.remove(originClass);
                        secondNavEl.classList.add('second-nav-'+changeClass+'-background');
                    }

                    return isIntersecting;
                });

                if (!res) {
                    let changeClass = handleSecondTabs.$secondEleWhiteBg&&handleSecondTabs.$secondEleWhiteBg.length>0?'white':'black';
                    let originClass = handleSecondTabs.$secondEleWhiteBg&&handleSecondTabs.$secondEleWhiteBg.length>0?'black':'white';
                    secondNavEl.classList.remove('second-nav-'+originClass+'-background');
                    secondNavEl.classList.add('second-nav-'+changeClass+'-background');
                }
            }
        }
    };

    var ecLoginItems = {
        init: function () {
            var _this = this;
            // 手机端 判断是否为support首页,判断方法是pageName以cbg:开头，以:support结尾
            if (window.innerWidth < _this.uiBoundaryVal && window.pageCategory == "support") {
                $(".nav-addons .nav-toggle").click(function () {
                    $($(".main-nav .is-support-menu").find("a")[0]).click();
                });
            }
            // add account links for login and logout
            $('.show-logout .login-extra-item-html').html(_this.renderLoginItems(true));
            $('.show-login .login-extra-item-html').html(_this.renderLoginItems(false));


            if (window.isECommerceSite === "None") {
                $('body').addClass('none-ecommerce');
            }
        },
        renderLoginItems: function (isLogin) {
            var itemString = $('#login-extra-item').val();
            if (!itemString) {
                return;
            }

            var html = '';
            var items = JSON.parse(itemString);
            // deal login order url
            if (isLogin) {
                var orderNav = items.filter(function (item) {
                    return item.url.indexOf('order') > -1;
                });
                if (orderNav.length > 0) {
                    orderNav[0].url = window.dialogLinkHandler($("#ec-url-orderListLink").val());
                    orderNav[0].text = ecCom.I18n.get("ec_my_order");
                }
            }
            for (var i = 0; i < items.length; ++i) {
                html += '<li class="login-other-items main-nav__item">' +
                    '<a href="' + window.dialogLinkHandler(items[i].url) + '" title="' + items[i].text +
                    '" target="' + (items[i].openNewPage ? '_blank' : '_self') +
                    '" class="a-support-common dmpa-click-dispach" cat="pop_up_account" act="click_on_' + items[i].text +
                    '" lab="${item.text}"' +
                    '>' +
                    '<img class="left-icon"' + (items[i].iconPath ? 'src="' + items[i].iconPath + '" alt="icon" ' : "") +
                    ' style="width:24px; height: 24px;display: none;' + (items[i].iconPath ? '' : 'visibility: hidden;') + '">' +
                    '<span>' + items[i].text + '</span>' +
                    '</a>' +
                    (items[i].rightIcon ?
                        '<img class="right-icon" src="' + items[i].rightIcon + '" alt="icon"/>' : '') +
                    '</li>';
            }

            return html;
        }
    };

    $(function () {
        handleMainNavigation.init();
        handleSecondTabs.init();
        ecLoginItems.init();

    });

    $(window).on('load resize',  ()=> {
        handleMainNavigation.calcMainNavWidth();
        handleMainNavigation.bindIpJump();
        handleMainNavigation.handleSubmenuPopupPc();
        handleMainNavigation.handleSubmenuPopupMob();
        handleMainNavigation.handleResizeClickHoverToggle();
    });
    $(window).on('load',  ()=> {
        handleMainNavigation.handleMainNavWrapHeightV5();
    });
}());
(function (){
    var n02ExpandedProducts = {
        $selector: $('.n02-expanded-products'),
        navVersion: $("#header-v4 #mainNav").val() || 'nav-v1', //主导航版本，默认：nav-v1
        uiBoundaryVal: 1200, // PC和移动端UI切换边界值，默认 1200
        init: function() {
            var _this = this;
            _this.uiBoundaryVal = _this.navVersion == 'nav-v1' ? 1200 : 1366;
            if (_this.$selector.length) {
                _this.imageDimension();
            }
            $(window).on('load', function() {
                setTimeout(function() {
                    _this.imageDimension()
                }, 100)
            })
            $(window).on('resize', function() {
                _this.imageDimension()
            })
        },

        imageDimension: function() {
            var _this = this
            if ($(window).width() > _this.uiBoundaryVal) {
                _this.$selector.each(function() {
                    var $twoImgColumn = $(this).find('.dropdown__holder--two-img')
                    var $fourImgolumn = $(this).find('.dropdown__holder--four-img')
                    if ($twoImgColumn.length && $fourImgolumn.length) {
                        var imgHeight = $fourImgolumn.css('padding-top')
                        var blockHeight = $(this)
                            .find('.dropdown__four-images .dropdown__right-col')
                            .height()
                        var sum = imgHeight + blockHeight
                        $(this)
                            .find('.dropdown__holder--two-img')
                            .css('padding-bottom', sum)
                    }
                })
            }
            if($(window).width() >= _this.uiBoundaryVal) {
                _this.mobileServicesbg(".one-two-icon .pc-bg");
            }
        },
        mobileServicesbg: function(bg){
            $(bg).each(function (index, element) {
                var pc = $(this).attr('pc-bg') || '';
                $(this).attr('style','background-image: url('+pc+')')
            });
        }
    }

    $(function() {
        n02ExpandedProducts.init();
    })

    $(document).on('click','.dropdown__block-item',function(){
        //dmpa埋码409
        var $serviceMktName = $(this).data('mobileservice'),//产品名称
            $link =  $(this).attr('href'),
            $pageUrl = CBG_SITE_ROOT.substring(0,CBG_SITE_ROOT.length-1) + '' + window.location.pathname,//绝对路径
            $partialPath = window.digitalData.page.category.pageType === 'homepage' ? 'homepage' : window.location.pathname.split(siteCode)[1];
        var eData = {
            category: "navigation interaction",
            label: $serviceMktName,
            value: $link,
            location: $pageUrl,
            uri: $partialPath,
            subModuleName:'Marketing'
        }
        if(typeof dmpa5 !== 'undefined'){
            dmpa5('trackEvent', 'click', eData);
        }
        //dmpa埋码409
    })
    $(document).on('click','.dropdown__big-link',function(){
        //dmpa埋码409
        var $linkName = $(this).attr('title'),//产品名称
            $link =  $(this).attr('href'),
            $pageUrl = CBG_SITE_ROOT.substring(0,CBG_SITE_ROOT.length-1) + '' + window.location.pathname,//绝对路径
            $partialPath = window.digitalData.page.category.pageType === 'homepage' ? 'homepage' : window.location.pathname.split(siteCode)[1];
        var eData = {
            category: "navigation interaction",
            label: $linkName,
            value: $link,
            location: $pageUrl,
            uri: $partialPath
        }
        if(typeof dmpa5 !== 'undefined'){
            dmpa5('trackEvent', 'click', eData);
        }
        //dmpa埋码409
    })
}());
(function (){
	var n03ExpandedSupport = {
		$selector: $('.n03-expanded-support'),
		$content: $('.js-item-content'),
		$link: $('.js-support-link'),
		activeClass: 'dropdown__big-link--active',
		visibleClass: 'dropdown__row--visible',

		init: function() {
			if(this.$selector.length) {
				this.supportNav();
			}
		},

		supportNav: function() {
			var _this = this;
			this.$link.on('click', function(e) {
				var index = $(this).parent().index();
				_this.$link.removeClass(_this.activeClass);
				$(this).addClass(_this.activeClass);
				_this.$content.removeClass(_this.visibleClass);
				_this.$content.eq(index).addClass(_this.visibleClass);
				e.preventDefault();
			});
		}
	};

	$(function() {
		n03ExpandedSupport.init();
	});
}());
;(function (){
	var $searchInput = $('.js-search-autocomplete');

	var n12Search = {
		$selector: $('.n12-search'),
		$searchContainer: $('.search__form-container'),
		$searchInput: $searchInput,
		$btnClearSearch: $('.js-search-clear'),
		$popularWrap: $('.popular-show-wrap'),
		$popularProduct: $('.popular-product .dropdown__row-mobile'),
		searchFormAutocompleteVisibleClass: 'search__form-container--autocomplete-visible',
		hotSearchTxt:$('.n12-search #headerHotSearchText').val() || '',
		canSearch: false, // 是否可搜索 状态
		keywords:'',	// 搜索关键词
		phCanSearch : $searchInput.data('enable-ph-search') || 'no',	// 是否启用placeholder 作为热搜词进行搜索
		phVal: $searchInput.attr('placeholder'),	// placeholder值
		scheme: window.location.protocol + '//',
		domain: window.location.host + '/',
		supportApiUrl: supportv2.supportApiUrl,
		pageInfo: window.digitalData.page.pageInfo,
		popularData: [],
		lazyInitFlag:true,
		init: function () {
			if (this.$selector.length) {
				this.reHandleSearchPopupPos();
				this.lazyInit()
				this.clearSearch();
				this.handleSearchSubmit();
				this.bindGAListener();
				this.bindHAListener();
			}
		},
		lazyInit:function(){
			var _this = this
			 $('.js-open-search').click(function(){
				if(_this.lazyInitFlag){
					// 获取最新搜索状态
					_this.getSearchStatus();

					_this.lazyInitFlag = false
					_this.getJson();
					_this.handleImgs();
				}
			 })
		},
		handleImgs:function(){
		    $('.n12-search .dropdown__image-centered').attr('src',function(){
		        return $(this).attr('data-src');
		    });
		},
		reHandleSearchPopupPos: function(){
			let isHandled = this.__isHandled;

			if(isHandled){
				return;
			}

			this.__isHandled = true;

			let headerPlaceholderEl = document.getElementById('header-placeholder');
			let headerEl = document.getElementById('header-v4');
			let n12SearchEl = document.querySelector('.n12-search[data-component=n12-search]');
			let n04PlatformSelection = $(headerEl).data('n04PlatformSelection');

			if(!(headerPlaceholderEl && headerEl && n12SearchEl)){
				return;
			}

			let callback = function() {
				Promise.resolve().then(function(){
					let height = headerEl.getBoundingClientRect().height + 'px';
					headerPlaceholderEl.style.height = height;
					n12SearchEl.style.top = height;
					document.documentElement.style.setProperty('--header_placeholder_height', height);
					n04PlatformSelection && n04PlatformSelection.$selector.hasClass(n04PlatformSelection.platformSelectionOpenedClass) && n04PlatformSelection.adaptPageUI();
				});
			}

			let callbackFunction = mktHelpers.debounce ? mktHelpers.debounce(callback, 300) : callback;
			let isBreadcrumbNav = window.innerWidth < 1366 || $('.v4.header').hasClass('mb-ui');
			let __callback = isBreadcrumbNav ? callbackFunction : callback;

			window.addEventListener('resize', __callback);

			let observer = new MutationObserver(__callback);

			observer.observe(headerEl, {
				attributes: true,
				attributeFilter: ['class','style'],
				subtree: true,
				childList: true
			});
		},
		optimizeSearchLink:function(){
			/* 搜索框内部问题 */
			var searchDropdownLink = $(".n12-search.popup").find(".dropdown__series-link");

			searchDropdownLink.on("focus",function(){
				var $dropdownHolder = $(this).children(".dropdown__holder");
				$dropdownHolder.length > 0 && $dropdownHolder.addClass("h-focus-active");
			})
			searchDropdownLink.on("blur",function(){
				var $dropdownHolder = $(this).children(".dropdown__holder");
				$dropdownHolder.length > 0 && $dropdownHolder.removeClass("h-focus-active");
			})
		},
		initPopularSearch: function () {
			let _this = this;
			_this.$searchContainer.addClass(_this.searchFormAutocompleteVisibleClass);

			_this.optimizeSearchLink();

			_this.$popularWrap.addClass(_this.searchFormAutocompleteVisibleClass);
			let $focusEle = $('.easy-autocomplete-container ul');
			let title = '<div class="eac-category" aria-disabled="true"  aria-hidden="true">' + filterXSS($(".popular-text").attr("data-value")) + '</div>';
			let li = '';
			$.each(_this.popularData, function (value, item) {
				// 点击搜索流行词（搜索流行词） HA
				if (window.location.href.indexOf("/support") != -1) {
					li += '<li><div class="eac-item">' + "<a class='popular-word' title='" + filterXSS(item) + "' href='" + _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(filterXSS(item)) + '&tag=support' + "'>" + filterXSS(item) + '</a>' + '</div></li>';
				}else{
					li += '<li><div class="eac-item">' + "<a class='popular-word' title='" + filterXSS(item) + "' href='" + _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(filterXSS(item)) + "'>" + filterXSS(item) + '</a>' + '</div></li>';
				}
			});
			$focusEle.empty().append(title).append(li).show();
		},
		getJson: function () {
			var _this = this;
			var previewStr =  Mkt.Util.isPreviewMode ? Mkt.Constants.SITE_ROOT_PATH : '';
			$.ajax({
				url: _this.scheme + _this.domain + previewStr + _this.pageInfo.siteCode2 + '/_jcr_content.allProducts.json',
				success: function (res) {
					if(res && res.allProduct && res.allProduct.length>0){
						_this.initSearchAutocomplete({
							suggested: res.allProduct.split(',')
						});
					}
				}
			});

			if(typeof sgwHost == 'undefined' || sgwHost == null || sgwHost == ''){
				$.ajax({
					url:  _this.supportApiUrl + '/services/service/vofficial/hot',
					type: 'GET',
					data: {
						qAppName: 'HuaweiOfficial',
						site: _this.pageInfo.siteCode2.toUpperCase(),
						language: _this.pageInfo.language ? _this.pageInfo.language.replace('_', '-') : ''
					},
					dataType: 'jsonp',
					jsonp: 'jsonp',
					success: function (res) {
						for (var i in res) {
							_this.popularData.push(res[i].key);
						}
					}
				});

			}else{
				$.ajax({
					type:"GET",
					url: sgwHost+"/cmkt/venus/hot/1",
					dataType: "json",
					jsonp:"json",
					contentType:"application/json",
					data:{appName:"HuaweiOfficial",language:window.digitalData.page.pageInfo.siteCode2.toUpperCase()},
					beforeSend:function(xhr){
						xhr.setRequestHeader("SGW-APP-ID",sgwAppId);
					},
					success: function(response) {
						if(response.result && response.result.length > 0){
							var res = response.result;
							for (var i in res) {
								_this.popularData.push(res[i].key);
							}
						}
					}
				})
			}

		},
		initEachProduct: function (data) {
			var _this = this;
			$.each(data, function (index, value) {
				if (index < 3) {
					var infoArr = value.replace(/\|\|/, '|').split('|');
					_this.$popularProduct.append('<div class="list dropdown__right-col col-xl-4 col-xs-6"><a class="dropdown__series-link" href="'  + infoArr[2].replace('/content/huawei-cbg-site', '') + '"><div class="dropdown__holder"><img class="dropdown__image-centered" src="'+ infoArr[1] + '"/></div></a><div><a class="heading dropdown__series-link" href="'+ infoArr[2].replace('/content/huawei-cbg-site', '') + '">' + infoArr[0] + '</a></div></div>');
				}
			});
		},
		initSearchAutocomplete: function (data) {
			if (this.$searchInput.length) {
				var _this = this;
				this.$searchInput
					.easyAutocomplete({
						data: data,
						template: {
							type: 'custom',
							method: function (value, item) {
								return "<a class='associative-word' title='" + value + "' href='" + _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(item) + "'>" + value + '</a>';
							}
						},
						categories: [
							{
								listLocation: 'suggested',
								header: $(".suggested-text").attr("data-value"),
								maxNumberOfElements: 10
							}
						],
						list: {
							maxNumberOfElements: 10,
							match: {
								enabled: true
							},
							onShowListEvent: function () {
								_this.$searchContainer.addClass(_this.searchFormAutocompleteVisibleClass);
								_this.$popularWrap.addClass(_this.searchFormAutocompleteVisibleClass);
								_this.optimizeSearchLink();
								if (_this.$searchInput.val().trim().length < 1 && _this.$searchInput.is(':focus')) {
									_this.initPopularSearch();
								}
							},
							onHideListEvent: function () {
								_this.$searchContainer.removeClass(_this.searchFormAutocompleteVisibleClass);
								_this.$popularWrap.removeClass(_this.searchFormAutocompleteVisibleClass);
								if (_this.$searchInput.val().trim().length < 1 && _this.$searchInput.is(':focus')) {
									_this.initPopularSearch();
								}
							}
						}
					})
				if($.isIos()){
					this.$searchInput.click(function () {
						if (_this.$searchInput.val().trim().length < 1 && _this.$searchInput.is(':focus')) {
							_this.initPopularSearch();
							_this.handleSearchSubmit();
						}
					});
				}else{
					this.$searchInput.focus(function () {
						if (_this.$searchInput.val().trim().length < 1 && _this.$searchInput.is(':focus')) {
							_this.initPopularSearch();
							_this.handleSearchSubmit();
						}
					});
				}
			}
		},
		getSearchStatus:function(){
			var _this = this;
			// 输入框值
			var inpVal = _this.$searchInput.val().trim();

			if(_this.phCanSearch =='yes' && _this.phVal && inpVal.length == 0){
				_this.canSearch = true;
				_this.keywords = _this.phVal;
			}else if(inpVal.length > 1){
				_this.canSearch = true;
				_this.keywords = inpVal;
			}else{
				_this.canSearch = false;
			}

			if(_this.canSearch){
				$('.v4.n12-search .search__form-submit').addClass('active');
			}else{
				$('.v4.n12-search .search__form-submit').removeClass('active');
			}
		},
		handleSearchSubmit: function () {
			var _this = this;
			$('.search__form-submit').on('click', function () {
				_this.getSearchStatus();
				if (_this.canSearch) {
					// 顶部搜索弹窗点击搜索图标 HA
					buryPointHA("110200001", "search_btn_click", {
						"url": window.location.href,
						"title": document.title,
						"componentry_name": "search",
						"keyword": _this.keywords,
						"card_title": _this.keywords,
						"etype": "click"
					});
					if(window.location.href.indexOf("/support") != -1){
						window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywords) + "&tag=support";
					}
					else{
						window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywords);
					}
				} else {
					$('.n12-search .search_toast').fadeIn().delay(2000).fadeOut();
				}
			});
			_this.$searchInput.keyup(function (event) {
				_this.getSearchStatus();
				if (event.keyCode == '13') {
					if (_this.canSearch) {
						// 顶部弹窗回车搜索内容 HA
						buryPointHA("110200001", "search_btn_click", {
							"url": window.location.href,
							"title": document.title,
							"componentry_name": "search",
							"keyword": _this.keywords,
							"card_title": _this.keywords,
							"etype": "click"
						});
						if(window.location.href.indexOf("/support") != -1){
							window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywords) + "&tag=support";
						}
						else{
							window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywords);
						}
					} else {
						$('.n12-search .search_toast').fadeIn().delay(2000).fadeOut();
					}
				}
			});
		},
		clearSearch: function () {
			var _this = this;
			_this.$btnClearSearch.on('click', function () {
				_this.$searchInput.val('');
			});
		},
		bindGAListener: function(){
			var pageType = digitalData.page.category.pageType || "";
			$('.popular-product .dropdown__row-mobile').find(".search-popular-product-link").on("click", function(){
				var position = $(this).attr("data-position") || "";
				var mktName = $(this).attr("title") || "";
				if (mktName === "") {
					mktName = $(this).text() || "";
				}
				mktName = mktName.replace(/[\r\n]/g, "").replace(/<\/?[^>]*>/g, "").trim();
				window.dataLayer.push({
					clickName: "search_section click to pdp_ " + mktName + "_" + position,
					clickType: "action",
					event: "headerComponentSearchToPDP",
					pageCategory: pageType,
					productMktName: mktName,
					productPosition: position
				});

				// 点击推荐卡片（推荐搜索） HA
				buryPointHA("110200002", "search_recommend_click", {
					"url": window.location.href,
					"title": document.title,
					"componentry_name": "search",
					"keyword": mktName,
					"card_title": mktName,
					"etype": "click"
				});
			});
			$(".quick-link").find(".search-quick-link").on("click", function(){
				var linkName = $(this).attr("title") || '';
				if (linkName === "") {
					linkName = $(this).text() || "";
				}
				window.dataLayer.push({
					clickName: "search_section click " + linkName,
					clickType: "action",
					event: "headerComponentSearchSection",
					pageCategory: pageType,
					linkName: linkName
				});
			});
		},
		bindHAListener: function(){
			$('body').on('click', '.easy-autocomplete-container li .eac-item a', function (e) {
				var title = $(this).text() || '';
				title = title.replace(/[\r\n]/g, "").replace(/<\/?[^>]*>/g, "").trim();
				// 联想词搜索 HA
				if ($(this).hasClass("associative-word")) {
					buryPointHA("110200003", "search_suggestion_click", {
						"url": window.location.href,
						"title": document.title,
						"componentry_name": "search",
						"keyword": title,
						"card_title": title,
						"etype": "click"
					});
				}

				// 流行词搜索 HA
				if ($(this).hasClass("popular-word")) {
					buryPointHA("110200004", "search_popular_click", {
						"url": window.location.href,
						"title": document.title,
						"componentry_name": "search",
						"keyword": title,
						"card_title": title,
						"etype": "click"
					});
				}
			});
		}
	};

	let n12SearchV5 = {
		$selectorV5: $('.v5-style .n12-search'),
		$searchInputV5: $('.v5-style .js-search-autocomplete'),
		$searchContainerV5: $('.v5-style .search__form-container'),
		$btnClearSearchV5: $('.v5-style .js-search-clear'),
		$popularWrapV5: $('.v5-style .popular-show-wrap'),
		searchFormVisibleClassV5: 'search__form-container--autocomplete-visible',
		canSearchV5: false, // 是否可搜索 状态
		keywordsV5:'',	// 搜索关键词
		phCanSearchV5 : $('.v5-style .js-search-autocomplete').data('enable-ph-search') || 'no',	// 是否启用placeholder 作为热搜词进行搜索
		phValV5: $('.v5-style .js-search-autocomplete').attr('placeholder'),	// placeholder值
		scheme: window.location.protocol + '//',
		domain: window.location.host + '/',
		supportApiUrl: supportv2.supportApiUrl,
		pageInfo: window.digitalData.page.pageInfo,
		popularDataV5: [],
		suggestedDataV5:[],
		lazyInitFlag:true,
		isV5Version: $('.v4.header').hasClass('v5-style') || false,
		popUpHeightV5:'',
		$hotSearchV5:$('.v5-style .hot-search-v5'),
		$suggestedSearchV5:$('.v5-style .suggested-search-v5'),
		currentPageIsEcSite:window.isECommerceSite !== 'None',
		init: function () {
			if (this.$selectorV5.length) {
				this.reHandleSearchPopupPosV5();
				this.lazyInit();
				this.handleSearchSubmitV5();
				this.handleDomTitleV5();
				this.clearSearchForV5();
				this.bindGAListenerV5();
				this.bindHAListenerV5();
			}
		},
		lazyInit:function(){
			let _this = this
			$('.js-open-search').on('click', ()=> {
				if(_this.lazyInitFlag){
					// 获取最新搜索状态
					_this.popUpHeightV5 = $('.v5-style .n12-search.popup').height();
					_this.getSearchStatus();
					_this.getJsonV5();
					_this.handleSearchInputClick();
					_this.handleSearchInputChange();
					_this.handleSearchV5Event();
					_this.lazyInitFlag = false;
				}
			})
		},
		reHandleSearchPopupPosV5: function(){
			let isHandled = this.__isHandled;

			if(isHandled){
				return;
			}

			this.__isHandled = true;

			let headerPlaceholderEl = document.getElementById("header-placeholder");
			let headerEl = document.getElementById("header-v4");
			let n12SearchEl = document.querySelector(".n12-search[data-component=n12-search]");
			let n04PlatformSelection = $(headerEl).data("n04PlatformSelection");

			if(!(headerPlaceholderEl && headerEl && n12SearchEl)){
				return;
			}

			let callback = function() {
				Promise.resolve().then(()=>{
					let height = headerEl.getBoundingClientRect().height + "px";
					headerPlaceholderEl.style.height = height;
					n12SearchEl.style.top = height;
					document.documentElement.style.setProperty("--header_placeholder_height", height);
					n04PlatformSelection && n04PlatformSelection.$selector.hasClass(n04PlatformSelection.platformSelectionOpenedClass) && n04PlatformSelection.adaptPageUI();

				});
			}
			let callbackFunc = mktHelpers.debounce ? mktHelpers.debounce(callback, 300) : callback;
			let __callback = n12SearchV5.isV5Version && window.innerWidth > 1079 ? callback : callbackFunc;

			window.addEventListener("resize", __callback);

			let observer = new MutationObserver(__callback);

			observer.observe(headerEl, {
				attributes: true,
				attributeFilter: ["class","style"],
				subtree: true,
				childList: true
			});
		},
		optimizeSearchLink:function(){
			/* 搜索框内部问题 */
			let searchDropdownLink = $('.n12-search.popup').find('.dropdown__series-link');

			searchDropdownLink.on('focus',function(){
				let $dropdownHolder = $(this).children(".dropdown__holder");
				$dropdownHolder.length > 0 && $dropdownHolder.addClass("h-focus-active");
			})
			searchDropdownLink.on('blur',function(){
				let $dropdownHolder = $(this).children(".dropdown__holder");
				$dropdownHolder.length > 0 && $dropdownHolder.removeClass("h-focus-active");
			})
		},
		initHotSearchV5: function () {
			let that = this;
			that.$searchContainerV5.addClass(that.searchFormVisibleClassV5);
			that.$popularWrapV5.addClass(that.searchFormVisibleClassV5);
			that.$hotSearchV5.show();
			that.optimizeSearchLink();

			let $focusEle = $('.hot-search-v5 ul');
			let li = '';
			$.each(that.popularDataV5, (index, item)=> {
				if (index === 5) {
					return;
				}
				if (window.location.href.indexOf("/support") !== -1) {
					li += '<li><div class="eac-item">' + "<a class='popular-word title-hide-v5' title='" + filterXSS(item) + "' href='" + that.scheme + that.domain + that.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(filterXSS(item)) + '&tag=support' + "'>" + filterXSS(item) + '</a>' + '</div></li>';
				}else{
					li += '<li><div class="eac-item">' + "<a class='popular-word title-hide-v5' title='" + filterXSS(item) + "' href='" + that.scheme + that.domain + that.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(filterXSS(item)) + "'>" + filterXSS(item) + '</a>' + '</div></li>';
				}
			});
			$focusEle.empty().append(li).show();
		},
		getJsonV5: function () {
			let _this = this;
			let previewStr =  Mkt.Util.isPreviewMode ? Mkt.Constants.SITE_ROOT_PATH : '';
			let url = _this.scheme + _this.domain + previewStr + _this.pageInfo.siteCode2 + '/_jcr_content.allProducts.json';
			$.ajax({
				url,
				success: (res)=> {
					if(res && res.allProduct && res.allProduct.length>0){
						n12SearchV5.suggestedDataV5 = res.allProduct.split(',')
					}
				}
			});

			if(typeof sgwHost === 'undefined' || sgwHost === null || sgwHost === ''){
				$.ajax({
					url:  _this.supportApiUrl + "/services/service/vofficial/hot",
					type: "GET",
					data: {
						qAppName: "HuaweiOfficial",
						site: _this.pageInfo.siteCode2.toUpperCase(),
						language: _this.pageInfo.language ? _this.pageInfo.language.replace("_", "-") : ""
					},
					dataType: "jsonp",
					jsonp: "jsonp",
					success: function (res) {
						res.forEach(item => {
							_this.popularDataV5.push(item.key);
						});
					}
				});

			}else{
				$.ajax({
					url: sgwHost+"/cmkt/venus/hot/1",
					type:"GET",
					contentType:"application/json",
					data:{appName:"HuaweiOfficial",language:window.digitalData.page.pageInfo.siteCode2.toUpperCase()},
					dataType: "json",
					jsonp:"json",
					beforeSend:function(xhr){
						xhr.setRequestHeader("SGW-APP-ID",sgwAppId);
					},
					success: function(response) {
						if(response.result && response.result.length > 0){
							let res = response.result;
							res.forEach(item => {
								_this.popularDataV5.push(item.key);
							});
						}
					}
				})
			}

		},
		initSuggestedSearchV5: function () {
			let suggestedData = n12SearchV5.suggestedDataV5;
			let inputValueV5 = filterXSS(this.$searchInputV5.val().trim());
			let $suggestedSearchV5Ul = $('.v5-style .suggested-search-v5 ul');
			if (this.$searchInputV5.length) {
				let that = this;

				$suggestedSearchV5Ul.empty();

				if (inputValueV5.length > 0) {
					let searchNum = 4;
					let num = 0;
					let htmlStr = '';

					for (let i = 0;i < suggestedData.length; i++) {
						let rl = HeightKey(suggestedData[i], inputValueV5, 'strong');

						if (rl !== suggestedData[i]) {
							htmlStr += ("<li>"+
											"<a class='associative-word title-hide-v5' title='" + value + "' href='" + that.scheme + that.domain + that.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(suggestedData[i]) + "'>" + rl + "</a>" +
										"</li>");
							num++;
							if (num > searchNum) break;
						}
					}

					if (num !== 0) {
						$suggestedSearchV5Ul.append(htmlStr);
						$suggestedSearchV5Ul.data('lastMatchedSuggestion',htmlStr);
						n12SearchV5.$suggestedSearchV5.show();
						n12SearchV5.$hotSearchV5.hide();
						n12SearchV5.handleSearchPopupAnimateV5(false,$('.suggested-search-v5 ul li').length);
					} else {
						let lastMatchedSuggestion = $suggestedSearchV5Ul.data('lastMatchedSuggestion');
						if(lastMatchedSuggestion){
							$suggestedSearchV5Ul.append(lastMatchedSuggestion);
							n12SearchV5.$suggestedSearchV5.show();
							n12SearchV5.$hotSearchV5.hide();
							n12SearchV5.handleSearchPopupAnimateV5(false,$('.suggested-search-v5 ul li').length);
						}else{
							n12SearchV5.$suggestedSearchV5.hide();
							n12SearchV5.$hotSearchV5.show();
							n12SearchV5.handleSearchPopupAnimateV5(false,$('.hot-search-v5 ul li').length);
						}
					}
				} else {
					n12SearchV5.$suggestedSearchV5.hide();
				}
			}
		},
		getSearchStatus:function(){
			let _this = this;
			// 输入框值
			let inpVal = _this.$searchInputV5.val().trim();

			if(_this.phCanSearchV5 ==='yes' && _this.phValV5 && inpVal.length === 0){
				_this.canSearchV5 = true;
				_this.keywordsV5 = _this.phValV5;
			}else if(inpVal.length > 1){
				_this.canSearchV5 = true;
				_this.keywordsV5 = inpVal;
			}else{
				_this.canSearchV5 = false;
			}

			if(_this.canSearchV5){
				$('.v4.n12-search .search__form-submit').addClass('active');
			}else{
				$('.v4.n12-search .search__form-submit').removeClass('active');
			}
		},
		handleSearchSubmitV5: function () {
			let _this = this;

			let searchBtnHaObj = {
				"componentry_name": "search",
				"keyword":"", //$搜索关键字
				"etype": "click"
			}

			$('.search__form-submit').on('click', function () {
				let $submitDom = $(this);
				_this.getSearchStatus();
				if (_this.canSearchV5) {
					// 顶部搜索弹窗点击搜索图标 HA

					searchBtnHaObj.keyword = filterXSS(_this.$searchInputV5.val().trim());

					_this.currentPageIsEcSite && Mkt.Util.pushHaPoint(
						"110200001",
						"search_btn_click",
						searchBtnHaObj
					);

					if(window.location.href.indexOf("/support") !== -1){
						window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywordsV5) + "&tag=support";
					}
					else{
						window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywordsV5);
					}
				} else {
					$('.n12-search .search_toast').fadeIn().delay(2000).fadeOut();
				}
			});
			_this.$searchInputV5.on('keyup',function (event) {
				let $searchInputDom = $(this);
				_this.getSearchStatus();
				if ( event.keyCode === 13 ) {
					if (_this.canSearchV5) {
						// 顶部弹窗回车搜索内容 HA
						searchBtnHaObj.keyword = filterXSS(_this.$searchInputV5.val().trim());

						_this.currentPageIsEcSite && Mkt.Util.pushHaPoint(
							"110200001",
							"search_btn_click",
							searchBtnHaObj
						);

						if(window.location.href.indexOf("/support") !== -1){
							window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywordsV5) + "&tag=support";
						}
						else{
							window.location.href = _this.scheme + _this.domain + _this.pageInfo.siteCode2 + '/search/?keyword=' + encodeURIComponent(_this.keywordsV5);
						}
					} else {
						$('.n12-search .search_toast').fadeIn().delay(2000).fadeOut();
					}
				}
			});
		},
		bindGAListenerV5: function(){
			let pageType = digitalData.page.category.pageType || "";
			$('.popular-product .dropdown__row-mobile').find(".search-popular-product-link").on("click", function(){
				let position = $(this).attr("data-position") || "";
				let mktName = $(this).attr("title") || "";
				if (mktName === "") {
					mktName = $(this).text() || "";
				}
				mktName = mktName.replace(/[\r\n]/g, "").replace(/<\/?[^>]*>/g, "").trim();
				window.dataLayer.push({
					clickName: "search_section click to pdp_ " + mktName + "_" + position,
					clickType: "action",
					event: "headerComponentSearchToPDP",
					pageCategory: pageType,
					productMktName: mktName,
					productPosition: position
				});

				// 点击推荐产品（推荐搜索/热门产品） HA
				let popularProductLinkHaObj = {
					"componentry_name": "search",
					"keyword": filterXSS(n12SearchV5.$searchInputV5.val().trim()), //$搜索关键字
					"card_title": mktName, //卡片标题
					"etype": "click"
				}

				n12SearchV5.currentPageIsEcSite && Mkt.Util.pushHaPoint(
					"110200002",
					"search_recommend_click",
					popularProductLinkHaObj
				);
			});
			$(".quick-link").find(".search-quick-link").on("click", function(){
				let linkName = $(this).attr("title") || '';
				if (linkName === "") {
					linkName = $(this).text() || "";
				}
				window.dataLayer.push({
					clickName: "search_section click " + linkName,
					clickType: "action",
					event: "headerComponentSearchSection",
					pageCategory: pageType,
					linkName: linkName
				});

				// 点击快速预览 HA
				let quickLinkHaObj = {
					"componentry_name": "search",
					"card_title": linkName, //卡片标题
					"keyword": filterXSS(n12SearchV5.$searchInputV5.val().trim()), //$搜索关键字
					"etype": "click"
				}

				n12SearchV5.currentPageIsEcSite && Mkt.Util.pushHaPoint(
					"110200012",
					"search_quick_view_click",
					quickLinkHaObj
				);
			});
		},
		bindHAListenerV5: function(){
			$('body').on('click', '.n12-search.popup.v4 .suggested-search-v5 li a', function (e) {
				let suggestedTitle = $(this).text() || '';
				suggestedTitle = suggestedTitle.replace(/[\r\n]/g, "").replace(/<\/?[^>]*>/g, "").trim();
				// 联想词搜索 HA
				let suggestedHaObj = {
					"componentry_name": "search",
					"card_title": suggestedTitle, //卡片标题
					"keyword": filterXSS(n12SearchV5.$searchInputV5.val().trim()), //$搜索关键字
					"etype": "click"
				}
				n12SearchV5.currentPageIsEcSite && Mkt.Util.pushHaPoint(
					"110200003",
					"search_suggestion_click",
					suggestedHaObj
				);

			});
			$('body').on('click', '.n12-search.popup.v4 .hot-search-v5 .eac-item a', function (e) {
				let hotSearchTitle = $(this).text() || '';
				hotSearchTitle = hotSearchTitle.replace(/[\r\n]/g, "").replace(/<\/?[^>]*>/g, "").trim();
				// 流行词搜索 HA
				let hotSearchHaObj = {
					"componentry_name": "search",
					"keyword": filterXSS(n12SearchV5.$searchInputV5.val().trim()), //$搜索关键字
					"card_title": hotSearchTitle, //卡片标题
					"etype": "click"
				}
				n12SearchV5.currentPageIsEcSite && Mkt.Util.pushHaPoint(
					"110200004",
					"search_popular_click",
					hotSearchHaObj
				);
			});
		},
		handleSearchInputClick: function(){
			if($.isIos()){
				n12SearchV5.$searchInputV5.on('click', ()=> {
					if (n12SearchV5.$searchInputV5.val().trim().length < 1 && n12SearchV5.$searchInputV5.is(':focus')) {
						n12SearchV5.initHotSearchV5();
						n12SearchV5.initSuggestedSearchV5();
					}
				});
			}else{
				n12SearchV5.$searchInputV5.on('focus', ()=> {
					if (n12SearchV5.$searchInputV5.val().trim().length < 1 && n12SearchV5.$searchInputV5.is(':focus')) {
						n12SearchV5.initHotSearchV5();
						n12SearchV5.initSuggestedSearchV5();
					}
				});
			}
		},
		handleSearchInputChange: function(){
			if(n12SearchV5.isV5Version) {

				n12SearchV5.$searchInputV5.get(0).addEventListener('input', function () {
					const inputValue = this.value;
					if (inputValue) {
						n12SearchV5.$popularWrapV5.addClass(n12SearchV5.searchFormVisibleClassV5);
						n12SearchV5.$searchContainerV5.addClass(n12SearchV5.searchFormVisibleClassV5);
						n12SearchV5.$searchContainerV5.addClass('search__form-container-showV5');
						n12SearchV5.initSuggestedSearchV5();
					} else {
						n12SearchV5.$suggestedSearchV5.hide();
						n12SearchV5.$searchContainerV5.removeClass('search__form-container-showV5');
						n12SearchV5.$searchContainerV5.removeClass(n12SearchV5.searchFormVisibleClassV5);
						n12SearchV5.$searchInputV5.focus();
					}
				});
			}

		},
		handleSearchV5Event: function() {
			if(n12SearchV5.isV5Version){

				n12SearchV5.$searchInputV5.get(0).addEventListener('blur', (event) => {
					if($.isIos() && window.innerWidth < 1080) {
						window.removeEventListener('touchmove', preventDefault);
					}
					if(event.relatedTarget){
						return;
					}
					n12SearchV5.handleSearchPopupAnimateV5(true);
					setTimeout(() => {
						n12SearchV5.$hotSearchV5.hide();
						n12SearchV5.$suggestedSearchV5.hide();
						n12SearchV5.$searchContainerV5.removeClass(n12SearchV5.searchFormVisibleClassV5);
						n12SearchV5.$searchContainerV5.removeClass('search__form-container-showV5');
						n12SearchV5.$popularWrapV5.removeClass(n12SearchV5.searchFormVisibleClassV5);
					}, 200);

				});

				n12SearchV5.$searchInputV5.get(0).addEventListener('focus', (event)=> {
					if($.isIos() && window.innerWidth < 1080){
						window.addEventListener('touchmove', preventDefault, { passive: false });
					}
					$('.v5-style .n12-search.popup').height(n12SearchV5.popUpHeightV5);
					let inputEvent = new Event('input', { bubbles: true });
					event.target.dispatchEvent(inputEvent);
					if(n12SearchV5.$searchInputV5.val().trim() === ''){
						n12SearchV5.handleSearchPopupAnimateV5(false,$('.hot-search-v5 ul li').length);
					}else{
						n12SearchV5.$searchContainerV5.addClass(n12SearchV5.searchFormVisibleClassV5);
						n12SearchV5.$popularWrapV5.addClass(n12SearchV5.searchFormVisibleClassV5);
						n12SearchV5.$searchContainerV5.addClass('search__form-container-showV5');
					}
				});
				function preventDefault(e) {
					e.preventDefault();
				}
			}
		},
		handleSearchPopupAnimateV5: function(flag,length){
			if(window.innerWidth > 1079){
				let newHeight = length<5?(165+length*39):360;
				let storedHeight = flag?n12SearchV5.popUpHeightV5:newHeight;
				$('.v5-style .n12-search.popup.popup--visible').stop().animate({
					height: storedHeight + 'px'
				}, 200);
			}
		},
		clearSearchForV5: function () {
			n12SearchV5.$btnClearSearchV5.on('click', () => {
				setTimeout(() => {
					n12SearchV5.$suggestedSearchV5.hide();
					n12SearchV5.$searchContainerV5.removeClass('search__form-container-showV5');
					n12SearchV5.$hotSearchV5.show();
					n12SearchV5.handleSearchPopupAnimateV5(false,$('.hot-search-v5 ul li').length);
					n12SearchV5.$searchInputV5.val('').focus();
					n12SearchV5.$popularWrapV5.addClass(n12SearchV5.searchFormVisibleClassV5);
				}, 200);
			});
		},
		handleDomTitleV5: function(){
			$(document).on('mouseenter', '.v5-style .title-hide-v5', function() {
				const $element = $(this);
				if ($element.attr('title')) {
					$element.removeAttr('title');
				}
			});
		}
	};
	$(function () {
		let isV5Version = $('.v4.header').hasClass('v5-style') || false;
		if(isV5Version){
			n12SearchV5.init();
		}else{
			n12Search.init();
		}
	});
}());
;(function (){
    let footerEle = document.querySelector('footer.n09-footer');
    let tipsHandler = handleTipsElPos();

    function handleTipsElPos() {
        let xOffsetDis = 14;
        let yOffsetDis = 6;
        let rect;
        let iconRect;
        let footerRect;
        let viewportWidth;
        let viewportHeight;

        function handleLteTwoRows(el) {
            let twoRowHeight = 40;
            let cls = 'lte-two-lines';
            let isContainsCls = el.classList.contains(cls);
            let isLteTwoRowsHeight = el.clientHeight <= twoRowHeight;

            !isContainsCls && isLteTwoRowsHeight && el.classList.add(cls);

            return isLteTwoRowsHeight;
        }

        const handlers = ({
            updateScopeVars: (el, iconEl) => {
                rect = el.getBoundingClientRect();
                iconRect = iconEl.getBoundingClientRect();
                footerRect = footerEle.getBoundingClientRect();
                viewportWidth = document.documentElement.clientWidth;
                viewportHeight = document.documentElement.clientHeight;
            },
            updateTips: (el, cb) => {
                let tipsEl = el.querySelector('.tooltips-container');

                handleLteTwoRows(tipsEl);

                (typeof cb === 'function') && requestAnimationFrame(cb);
            },
            handleXDirOffset: (el, iconEl)=> {
                handlers.updateScopeVars(el, iconEl);

                let halfIconWidth = 0.5 * iconRect.width;
                let halfTipsWidth = 0.5 * rect.width;
                let minLeftOffsetPos = iconRect.left + halfIconWidth - halfTipsWidth;
                let maxRightOffsetPos = iconRect.right - halfIconWidth + halfTipsWidth;

               let dis = 0;

               if (minLeftOffsetPos < xOffsetDis) {
                   dis = Math.floor(xOffsetDis - minLeftOffsetPos);
               } else if ((maxRightOffsetPos + xOffsetDis) > viewportWidth) {
                   dis = Math.floor(viewportWidth - xOffsetDis - maxRightOffsetPos + 2);
               }

               if (dis) {
                   el.style.setProperty('--offsetXPos', dis);
               }

               return dis;
            },
            handleYDir: (el, iconEl, isActive)=> {
                handlers.updateScopeVars(el, iconEl);
                let isFitInTop = (iconRect.top - footerRect.top - yOffsetDis) > rect.height;
                let isFitInViewportTop = iconRect.top - rect.height - yOffsetDis > 0;
                let isFitInViewportBottom = (viewportHeight - iconRect.bottom - rect.height) > yOffsetDis;
                let dir;

                if (isFitInTop && isFitInViewportTop) {
                    dir = 'downwards';
                } else if (isFitInViewportBottom) {
                    dir = 'upwards';
                } else {
                    dir = 'upwards';
                }

                el.dataset.dir = dir;
                isActive && el.closest('.footer-text-tips-container').classList.add('active');

                return dir;
            }
        });

        return handlers;
    }

    function handleTooltip(tipsContainer, _isActive) {
        let tipsEl = tipsContainer.querySelector('.footer-tips-content');
        let tipsIconEl = tipsContainer.querySelector('.footer-tips-icon');
        let isActive = typeof _isActive === 'boolean' ? _isActive : true;

        tipsHandler.updateTips(tipsContainer, () => {
            tipsHandler.handleYDir(tipsEl, tipsIconEl, isActive);
            tipsHandler.handleXDirOffset(tipsEl, tipsIconEl);
        });
    }

    function resetTimerForCloseTips(tipsContainer) {
        if (tipsContainer._closeTipsTimer) {
            window.clearTimeout(tipsContainer._closeTipsTimer);
            tipsContainer._closeTipsTimer = null;
        }

        tipsContainer._closeTipsTimer = window.setTimeout( () => {
            tipsContainer.classList.remove('active');
            tipsContainer._closeTipsTimer = null;
        }, 500);
    }

  var n09Footer = {
    $selector: $(footerEle),
    $socialLinks: $(".contact__social-links"),
    $scrollTopBtn: $(".js-scroll-top"),
    $tipsElements: $(footerEle).find('.footer-text-tips-container'),
    uspList: ".usp-list",
    $footerAccordionBtn: $(".js-footer-accordion-btn"),
    $lanChangeSelector: $(".language-switcher"),
    $gotoComplaintLinks: $(".footer-links__item .goto-complaint-page"),
    init: function () {
      if (this.$selector.length > 0) {
        this.updateGotoComplaintHref();
        this.bindScrollTopClick();
        this.footerAccordionLinks();
        this.initUspListSlider();
        this.footerTelInit();
        this.bindSiteChangeClick();
        this.handleBindHa();
        Mkt.Util.imgLazyLoad($('.footer img.img-lazy'));
        this.lazyLoadImg();
        this.handleAccessibilityEntrance();
        if(this.$socialLinks.length > 0) {
            // 图标懒加载
            this.lazyLoadIcon();
        }

        if (footerEle.classList.contains('v5-style') && this.$tipsElements.length) {
            this.handleAllTips();
        }else {
            tipsHandler = null;
        }

        var _this = this;
        $(window).on('scroll', function() {
          _this.lazyLoadImg();
          if(_this.$socialLinks.length > 0) {
            // 滚动图标懒加载
            _this.lazyLoadIcon();
          }
        });

        $(window).on("resize", function () {
          _this.initUspListSlider();
        });
        if(this.$selector.hasClass('v5-style')){
            this.handleCloneDom();
        }
      }
    },
    bindScrollTopClick: function () {
      this.$scrollTopBtn.on("click", function () {
        $("html, body").animate(
          {
            scrollTop: 0,
          },
          600
        );
      });
    },
    initUspListSlider: function () {
       if($('.n09-footer.footer').hasClass('v5-style')){
           $('.footer .usp-list__thumbnail-img').addClass('img-lazy');
           $(".n09-footer .swiper-next,.n09-footer .swiper-prev").hide();
           Mkt.Util.imgLazyLoad($('.footer .usp-list img.img-lazy'));
           return;
       }
      var _this = this;
      if (Mkt.Util.windowWidth() < 768 && $(this.uspList).length && $(".usp-list__container .usp-list__item").length > 1) {
        $(".n09-footer .swiper-next,.n09-footer .swiper-prev").show();

          !_this.__swiperIns && (_this.__swiperIns = new Swiper(_this.uspList, {
          speed: 600,
          loop: true,
          pagination: {
            el: '.usp-list .swiper-pagination',
          },
          navigation: {
            nextEl: ".n09-footer .swiper-next",
            prevEl: ".n09-footer .swiper-prev",
          },
          on:{
            slideChange: function(){
              // 横向滚动时，图片懒加载
              Mkt.Util.imgLazyLoad($(this.el).find('img'));
            }
          }
        }));
        $('.footer .swiper-slide-active img').addClass('img-lazy');
      } else {
        $('.footer .usp-list__thumbnail-img').addClass('img-lazy');
        $(".n09-footer .swiper-next,.n09-footer .swiper-prev").hide();
      }
      Mkt.Util.imgLazyLoad($('.footer .usp-list img.img-lazy'));
    },
    footerAccordionLinks: function () {
      var isV5VersionMediaScreen = $('.n09-footer.footer').hasClass('v5-style')?1080:992;
      if (window.innerWidth < isV5VersionMediaScreen) {
        /* 无障碍阅读，需要 菜单项可以选中，由于不是 a 标签，添加tabindex */
        $(".footer-links__title.js-footer-accordion-btn").attr("tabindex",0);

        function controlFooterItem (that) {
          that.toggleClass("footer-links__title--active");
          that.siblings(".footer-links__list").stop().slideToggle(300);
          if(that.hasClass('footer-links__title--active')){
              that.attr('aria-expanded',true);
              that.removeAttr('tabindex');
          }else{
              that.attr('aria-expanded',false);
              that.attr("tabindex",0);
          }
        }

        /* 无障碍阅读需求：将此方法添加键盘事件，让盲人通过回车选中展开菜单 */
        this.$footerAccordionBtn.on("keydown", function (event) {
            if (event.keyCode === 13) {
             controlFooterItem($(this));
            }
        });
        this.$footerAccordionBtn.on("click", function () {
          controlFooterItem($(this));
        });
      }
    },
    footerTelInit: function () {
      if ($(window).width() < 768) {
        $(".phone-icon").each(function (index, element) {
          var phone_a = $(element).text().replace(/\s*/g, "");
          var phone_b = $(element).text();
          var phone_html =
            "<a data-clicktocall='footer_center' href='tel:" +
            phone_a +
            "'>" +
              phone_b +
            "</a>";
          $(element).html(filterXSS(phone_html));
        });
      }
    },
    bindSiteChangeClick: function () {
      this.$lanChangeSelector.find("a").on("click", function () {
        var pathNameArr = window.location.pathname.split("/");
        if (pathNameArr && pathNameArr.length > 1) {
          sessionStorage.setItem("origin_site_path", pathNameArr[1]);
        }

        var obj = {
          event: "footerCountrySwitch",
          clickName: "country switch_enter",
          clickType: "action",
        };
        window.dataLayer.push(obj);
      });
    },
    lazyLoadImg: function(){

        this.$selector.find(".lazyload-target:in-viewport").each(function () {
              var $target = $(this);
              $target.find(".lazyload-img").each(function(){
                  var $lazy = $(this);
                  if($lazy.is("img")){
                      $lazy.attr("src", $lazy.attr("data-src"));
                      $target.removeClass("lazyload-target");
                  }else if($lazy.is("source")){
                      $lazy.attr("srcset", $lazy.attr("data-srcset"));
                      $target.removeClass("lazyload-target");
                  }
              })
        });
    },
    lazyLoadIcon: function(){
        var clientHeight = document.documentElement.clientHeight;
        var scrollHeight = document.documentElement.scrollTop || document.body.scrollTop;
        var iconHeight = this.$socialLinks.offset().top - 100;
        if(iconHeight < clientHeight + scrollHeight){
            this.$socialLinks.find("li").each(function(){
                var $Icon = $(this).find(".icon-lazy");
                $Icon.addClass($Icon.attr("data-name"));
            })
        }
    },
    updateGotoComplaintHref: function(){
        this.$gotoComplaintLinks.attr('href', function(){
            return $(this).attr('href') + '?contentTitle='+ document.location.pathname;
        });
    },
    handleCloneDom:function(){
        var siteCode = window.digitalData.page.pageInfo.siteCode || '';
        if((siteCode == 'cn') && window.innerWidth < 1080){
            var footerOffline = $('.footer-links__list .footer-offline-support-box').clone();
            var footerFollow = $('.footer-links__list .footer-follow-us-box').clone();

            var footerColTopDom = $("<div class='col-xl-2 col-lg-4'></div>");

            var footerLinksBlock = $("<div class='footer-links__block'></div>");

            var footerLinksList = $("<ul class='footer-links__list v5-footer-link-list'></ul>");

            footerLinksList.append(footerOffline);
            footerLinksList.append(footerFollow);
            footerLinksBlock.append(footerLinksList);
            footerColTopDom.append(footerLinksBlock);

            $('.v5-style.v4.n09-footer .container .footer-links .row').append(footerColTopDom);
        }

        var v5ContactTitleDom = $('.footer-online-support-box .heading.contact__title.heading-06');
        if(v5ContactTitleDom.length){
            v5ContactTitleDom.html().length==0?v5ContactTitleDom.hide():'';
        }
        var $v5ContactRowDom = $('.v5-style.v4.n09-footer .contact .row');
        var $v5ContactDom = $('.v5-style.v4.n09-footer .contact');
        if($v5ContactRowDom.length){
            $v5ContactRowDom.children().length == 0?$v5ContactDom.hide():'';
        }
        if(window.innerWidth < 1080){
            $('.footer-offline-support-box .heading').on('click',function(){
                $(this).nextAll().slideToggle(300);
            })
            $('.footer-follow-us-box .heading').on('click',function(){
                $(this).next('.contact__social-links').slideToggle(300);
            })
        }
    },
    handleEyeAbleAssistScripts: function () {
        let assistLoaded = false;
        if(assistLoaded) {
            return;
        }
        let huaweiHeadDom = document.querySelector('head') || document.body;
        let firstScript = document.createElement('script');
        let secondScript = document.createElement('script');
        firstScript.src = 'https://cdn.eye-able.com/public/js/eyeAble.js';
        firstScript.async = true;
        secondScript.src = 'https://cdn.eye-able.com/configs/consumer.huawei.com.js';
        secondScript.async = true;
        secondScript.onload = function () {
            huaweiHeadDom.appendChild(firstScript);
        }
        huaweiHeadDom.appendChild(secondScript);
        assistLoaded = true;
    },
    handleAccessibilityEntrance:function(){
        let $jsAccessibilityEntrance = $('.n09-footer .footer-links__list .js-accessibility-entrance');
        if($jsAccessibilityEntrance.length){
            n09Footer.handleEyeAbleAssistScripts(); // 加载EyeAble.js
            $jsAccessibilityEntrance.removeAttr("href");
            $("body").append('<div class="mkt-accessibility-entrance" id="eyeAble_customToolOpenerID"></div>');
        }

        let $entrancePopupDom = $('.mkt-accessibility-entrance');
        if(!$entrancePopupDom.length){
            return
        }


        $(document).on('click','.n09-footer .footer-links__list .js-accessibility-entrance',(event)=>{
            event.preventDefault();
            $entrancePopupDom.toggle();
            n09Footer.handleEntrancePopupPosition();
            n09Footer.calcQuestionnairePosition();
        });
        n09Footer.handleQuestionnaireObserver();
        window.handleEntrancePopupPosition = n09Footer.handleEntrancePopupPosition;
        $(window).on("resize",  ()=> {
            n09Footer.handleEntrancePopupPosition();
        });
    },
    handleEntrancePopupPosition:function(){
        if(!$('.mkt-accessibility-entrance').length){
            return;
        }
        let isMob = window.innerWidth < 991.98
        const initialBottom = isMob?16:40;
        let scrollTopMargin = window.innerWidth < 1080 ? 16 : 24;
        let designBottom = initialBottom ;
        let accessibilityLeftOrRight =  $("html").attr("dir") === "rtl"?'left':'right';
        let designLeft = '';

        // pdp页面 置顶按钮
        if($('.scroll-to-top_btn').length>0){
            let scrollToTopIconHeight = parseInt($('.scroll-to-top_btn').css('height')) || 0;
            let scrollToTopIconBottom = parseInt($('.corner-buttons').css('bottom')) || 0;
            designBottom = scrollToTopIconHeight + scrollToTopIconBottom + scrollTopMargin;
        }

        // offer页面 robot
        if($('.robot-icon-wap-text').length>0 && $('.robot-icon-wap-text').css('display')==='block' && window.innerWidth<1002.98){ //903分辨率以下 robot改变样式
            let robotIconHeight = parseInt($('.robot-icon-wap-text').outerWidth(true)) || 0;
            let robotIconBottom = parseInt($('.robot-icon-wap-text').css('bottom')) || 0;
            designBottom = (robotIconHeight/2) + robotIconBottom + 32;
            if(window.innerWidth < 1002.98){
                designLeft = 16;
            }
            $('.mkt-accessibility-entrance').css(accessibilityLeftOrRight, designLeft + 'px');
        }
        if($('.robot-icon-click').length>0 && $('.robot-icon-click').css('display')==='block' && window.innerWidth<1002.98){ //903分辨率以下 robot改变样式
            let robotClickIconHeight = parseInt($('.robot-icon-click').outerWidth(true)) || 0;
            let robotClickIconBottom = parseInt($('.robot-icon-click').css('bottom')) || 0;
            designBottom = robotClickIconHeight + robotClickIconBottom + 16;
        }

        // support 页面 联系我们
        let contactIconHeight = 0;
        let contactIconBottom = 0;
        let contactTop = window.innerWidth < 1080&&window.innerWidth > 767.98 ?16:0;
        if($('.custom-service-container .custom-service-v5').length>0){
            contactIconHeight = parseInt($('.custom-service-container .custom-service-v5').css('height')) || 112;
            contactIconBottom = parseInt($('.custom-service-container .custom-service-v5').css('bottom')) || 0;
            designBottom = contactIconHeight + contactIconBottom + contactTop;

            if(window.innerWidth > 1079.98){
                designLeft = 30;
            }else if(window.innerWidth < 1080 && window.innerWidth > 767.98){
                designLeft = 22;
            }else{
                designLeft = 10;
            }
            $('.mkt-accessibility-entrance').css(accessibilityLeftOrRight, designLeft + 'px');
        }

        // support 页面 问卷调差
        if($('.supportquestionnairedom-side .questionnaire-component-btn-box').length>0){
            if(!$('.supportquestionnairedom-side .questionnaire-component-btn-box').hasClass('questionnaire-hidden')){
                let questionnaireBottom = parseInt($('.supportquestionnairedom-side.questionnaire-v5-side').css('bottom')) || 0;
                let questionnaireHeight = parseInt($('.supportquestionnairedom-side.questionnaire-v5-side').css('height')) || 0;
                designBottom = questionnaireHeight + questionnaireBottom + scrollTopMargin;
            }else{
                designBottom = contactIconHeight + contactIconBottom + contactTop;
            }
        }

        $('.mkt-accessibility-entrance').css('bottom', designBottom + 'px');

    },
    handleQuestionnaireObserver: function(){
        let targetNode = document.querySelector('.supportquestionnairedom-side .questionnaire-component-btn-box');

        let config = { attributes: true, childList: false, subtree: false };

        let observer = new MutationObserver(()=> {
            if (!$(targetNode).hasClass('questionnaire-hidden')) {
                n09Footer.handleEntrancePopupPosition();
            }
        });
        if(targetNode){
            observer.observe(targetNode, config);
        }
    },
    calcQuestionnairePosition:function(){
        $(".supportquestionnairedom-side .close-right-top-btn").on("click",()=>{
            n09Footer.handleEntrancePopupPosition();
        })
        $(".supportquestionnairedom-side .questionnaire-component-content .btn-box .agree-btn").on("click",()=>{
            n09Footer.handleEntrancePopupPosition();
        })
        $(".supportquestionnairedom-side .questionnaire-component-content .btn-box .disagree-btn").on("click",()=>{
            n09Footer.handleEntrancePopupPosition();
        })

        $('.robot-icon-wap-text').on("click",()=>{
            n09Footer.handleEntrancePopupPosition();
        })
    },
    handleBindHa: function(){

        // Home_Navigation_Footer
        const isEcSite = window.isECommerceSite !== 'None';
        let $allCardListEl = $('.v4.n09-footer.footer');

        // Exposure
        isEcSite && Mkt.Util.elVisibleHandler($allCardListEl.toArray(), null, (ele) => {

            Mkt.Util.pushHaPoint("120200015", "Home_Navigation_Footer_Exposure", {
                "componentry_name":"Home_Navigation_Footer",
                "componentry_title": "",
                "etype": "exposure", //--只上报到组件级别，不区分具体点位

            });

        });


        // click
        let commonHaObj = {
            "componentry_name": "Home_Navigation_Footer",
            "componentry_title": "",
            "card_title": '', //$tab分类
            "button_name": '', //按钮文本--点击图片时传固定值picture
            "etype": "click",
        }

        // footer link
        $('.v4.n09-footer .footer-links__list .footer-links__item a').on('click', function () {

            let tabTitle = $(this).parents('.footer-links__block').find('.footer-links__title').text().trim() || '';
            let buttonName = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || '';

            commonHaObj.card_title = tabTitle;
            commonHaObj.button_name = buttonName;
            isEcSite && Mkt.Util.pushHaPoint("110200015","Home_Navigation_Footer_Click",commonHaObj);
        })

        // contact us
        $('.v4.n09-footer .contact__social-item a').on('click', function () {

            let tabTitle = $(this).parents('.contact__block.col-xl-4.col-md-6').find('.contact__title').text().trim() || '';
            let buttonName = $(this).attr('data-social') || $(this).attr("title") || '';

            commonHaObj.card_title = tabTitle;
            commonHaObj.button_name = buttonName;
            isEcSite && Mkt.Util.pushHaPoint("110200015","Home_Navigation_Footer_Click",commonHaObj);
        })

        //online-support
        $('.v4.n09-footer .contact__text a[href]').on('click', function () {

            let tabTitle = $(this).parents('.footer-links__block').find('.footer-links__title').text().trim() ||
                           $(this).parents('.contact__block').find('.contact__title').text().trim() || '';
            let buttonName = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || '';

            commonHaObj.card_title = tabTitle;
            commonHaObj.button_name = buttonName;
            isEcSite && Mkt.Util.pushHaPoint("110200015","Home_Navigation_Footer_Click",commonHaObj);
        })

        //footer-legals
        $('.v4.n09-footer .footer-legals .bottom-links__link a').on('click', function () {

            let buttonName = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || '';

            commonHaObj.card_title = '';
            commonHaObj.button_name = buttonName;
            isEcSite && Mkt.Util.pushHaPoint("110200015","Home_Navigation_Footer_Click",commonHaObj);
        })

        //language-switcher
        $('.v4.n09-footer .language-switcher a').on('click', function () {

            let buttonName = '';
            if($(this).hasClass('language-switcher__link')){
                buttonName = $(this).attr('data-title') || $(this).attr("title") || $(this).text().trim() || '';
            }else{
                buttonName = 'picture';
            }

            commonHaObj.card_title = '';
            commonHaObj.button_name = buttonName;
            isEcSite && Mkt.Util.pushHaPoint("110200015","Home_Navigation_Footer_Click",commonHaObj);
        })

    },
    handleAllTips: function () {
        let $footerTipsContainers = this.$tipsElements;
        let hasTouchEvent = 'ontouchstart' in document.documentElement;
        let listenerEventTypes = hasTouchEvent ? 'click' : 'mouseenter mouseleave';

        $footerTipsContainers.each((_, el) => handleTooltip(el, false));

        $(footerEle).on(listenerEventTypes, '.footer-tips-icon,.footer-tips-content', (ev) => {
            ev.stopPropagation();

            let type = ev.type;
            let tipsContainer = ev.target.closest('.footer-text-tips-container');

            $footerTipsContainers.each((_, el) => {
                if(el !== tipsContainer) {
                    el.classList.remove('active');
                }
            });

            if (type === 'mouseleave') {
                resetTimerForCloseTips(tipsContainer);
            } else {
                if (tipsContainer._closeTipsTimer) {
                    window.clearTimeout(tipsContainer._closeTipsTimer);
                }

                handleTooltip(tipsContainer);
            }
        });

        $(window).on('resize.footerTips scroll.footerTips', Mkt.Util.mktThrottle(() => {
            $footerTipsContainers.each((_, el) => handleTooltip(el, false));
        }, 150));

        $(document).on('click touchstart', (e) => {
            let tipsContainerEl = e.target.closest('.footer-text-tips-container');

            $footerTipsContainers.each((_, el) => {
                if (tipsContainerEl !== el) {
                    el.classList.remove('active');
                }
            });
        });
    }
  };
  $(function () {
    n09Footer.init();
  });
}());
var login_leave = null;

$(function() {
	//封装弹出隐私协议方法
	function popupPrivacyBox(){
		var isShowPrivacyPopup = isLogin() && authController.__userInfo != null;
		if(!isShowPrivacyPopup){
			$(".huawei-v4 .login-v4-wrap .login-v4 .a-sup-common.my-exit span").trigger('click');
		}else{
			var ageGroupFlag = mktHelpers.tryCatch(function(){return authController.__userInfo.ageGroupFlag;});
			if(ageGroupFlag == 2){
				return;
			}
			window.showPrivacyPopupByLogin(
				isShowPrivacyPopup,
				function(){
					$(".huawei-v4 .login-v4-wrap .login-v4 .a-sup-common.my-exit span").trigger('click');
				});
		}
	}
	// 通过privacyPopupSwitch开关处理隐私协议
	var $loginBox =  $('.huawei-v4 .login-v4-wrap .login-v4 ul.show-login');
	if(privacyPopupSwitch && $loginBox.length){
		//添加协议弹窗事件监听，原有儿童账号不影响弹出提示，所以此块针对儿童账号，都直接返回，由原儿童账号逻辑接管
		$(document).on('privacyPopup', function(e, isOnlyRemoveCache){
			var isEcComSite = authController.isEcComSitePage();

			// 隐私协议弹出的方法，排除电商的处理
			if(!isEcComSite){
				// isOnlyRemoveCache只是用来控制是否移除隐私协议的localStorage缓存的标志位
				var _isOnlyRemoveCache = typeof isOnlyRemoveCache === 'boolean' ? isOnlyRemoveCache : false;
				if(_isOnlyRemoveCache){
					window.localStorage.removeItem('privacyAgreement');
					return;
				}

				if(!isLogin()){
					return;
				}
				setTimeout(popupPrivacyBox);
			}
		});

		setTimeout(function(){
			$(document).trigger('privacyPopup');
		});
	}

	//登录
	$(".huawei-v4 .login-v4-wrap .login-v4 .signInBtn.a-sup-common").on("click", function(){
		window.location.href = getLoginUri();
	});

	//注册
	$(".huawei-v4 .login-v4-wrap .login-v4 .a-sup-common.registeredBtn").on("click", function(){
		window.location.href  = getRegisterUrl($(".huawei-v4 .login-v4-wrap ul.show-login").attr("data-register-type"));
	});

	if (isLogin()) {
		if($loginBox.length && (!authController.isEcComSitePage() || authController.isSupportPage())){
			var isLoggedIn = authController.__userInfo != null;
			// 如果未登录uum，重新执行uum登录，如果再次登录uum失败则登出cmkt，保证与cmkt登录统一；
			if(!isLoggedIn){
				var _loginUrl = authController.getLoginUrl(false);

				authController.syncLogin(_loginUrl,true, function(){
					if(!authController.checkIsLoggedIn(false)){
						$(".huawei-v4 .login-v4-wrap .app-sign-user .signin-user").text(getUumInfoName(authController.__userInfo));
						$(".huawei-v4 .login-v4-wrap .login-v4 .a-sup-common.my-exit span").trigger('click');
					}
				});
			} else {
				$(".huawei-v4 .login-v4-wrap .app-sign-user .signin-user").text(getUumInfoName(authController.__userInfo));
			}
		}

	$(".huawei-v4 .login-v4-wrap").addClass("signin");
    $(".huawei-v4 .login-v4-wrap .login-v4 .logout-btn .a-sup-common.my-exit,.conv3_nav .navcon .login-menu .my-exit,.conv3_wrap .user-center .my-exit,.user-info-header .user-info .my-exit").on("click", function() {
		//清理隐私协议缓存
		$(document).trigger('privacyPopup',true);

		webLogout();

      var _logoutUrl = $(".huawei-v4 .login-v4-wrap .login-v4 .login-v4-cnt .show-login").attr("data-support-url");
	  var __huaweiTimeUrl = "";
		try{
			__huaweiTimeUrl = loginApiUrl.huaweitimeApiUrl;
		}catch(e){

		}
		if(typeof huaweitimeLogout === 'function'){
			//学堂有配置
			if(__huaweiTimeUrl !=null && __huaweiTimeUrl != ""){
				huaweitimeLogout(function(){
					uumLogout(_logoutUrl);
				})
			} else {
				uumLogout(_logoutUrl);
			}
		}else{
			uumLogout(_logoutUrl);
		}
    });

    if ($(window).width() > 1199.98) {
      $(".huawei-v4 .login-v4-wrap.signin a.login-v4-but").click(function (event) {
        event.stopPropagation();
        window.location.href = $(".huawei-v4 .login-v4-wrap .login-v4 .login-v4-cnt .show-login").attr("data-support-usercenter-url");
      });
    }
  } else {
    $(".huawei-v4 .login-v4-wrap").removeClass("signin");
  }
});

// 未登录点击account center到登录页
function loginBeforeAccountCenter(callBackUrl) {
  window.getUPLoginUrl(callBackUrl).then(function(data) {
      if (!ecCom.isPC) {
          window.open(data.loginWapUrl, "_self");
      } else {
          window.open(data.loginWebUrl, "_self");
      }
  });
}
var CBG_SITE_ROOT = "/content/huawei-cbg-site/";
(function (){
	/**
	 * EN站点编码
	 */
	var REGION_CODE_EN  =	"EN";
	/* 为方便后期扩展，暂做注释
	var REGION_CODE_LEVANT = "LEVANT";
	var REGION_CODE_LATIN = "LATIN";
	*/
	var CBG_SITE_EDITOR_ROOT = "/editor.html/content/huawei-cbg-site/";

  	var $header = $(".header");
	var $headerPlaceHolder = $("#header-placeholder");

	var $mainNav = $('.header .n01-main-navigation');
	var $mainNavContent = $mainNav.find('.main-nav');
	var $mainNavPopup = $mainNav.find('.popup');

	var $headerSearch = $(".header .n12-search");
	var $login = $(".header .login-v4");

	var navVersion= $(".header #mainNav").val() || 'nav-v1'; //主导航版本，默认：nav-v1
	let isV5Header = $header.hasClass('v5-style');
	let uiBoundaryVal = (navVersion === 'nav-v1' || isV5Header) ? 1200 : 1366; // PC和移动端UI切换边界值，默认 1200

	/**
	 * 根据服务网关接口配置，选择是否使用服务网关接口
	 * @returns {string}
	 */
	function getIpLocationApiUrl(){
		var sgwApi = mktConfig.sgwApi;
		var locationApiUrl = "";
		if(sgwApi){
			locationApiUrl = sgwApi+"/cmkt/webapi/location/1";
		}else{
			locationApiUrl = mktConfig.websiteFunctionApi + "/services/service/webapi/location";
		}
		return locationApiUrl;
	}

	$(document).ready(function(){
		//app嵌套页面不展示
		if (window.integrationJsInterface || window.integrationJsInterfaceWebview) {
			return;
		}
		//未选择配置则不显示
		if($(".ip-jump-wrap").length == 0){
			return;
		}
		//选择后不再选
		if($.cookie("checkRegion")){
			return;
		}

		//worldwide页面不弹出提示
		if(location.href.indexOf("/en/worldwide") != -1){
			return;
		}

		$.ajax({
			type:"POST",
			url: getIpLocationApiUrl(),
			dataType:"json",
			contentType:"application/json",
			beforeSend:function(xhr){
				if(mktConfig.sgwApi){
					xhr.setRequestHeader("SGW-APP-ID",sgwAppId);
				}
			},
			data:{},
			success: function(result) {
				//当查询到的站点和当前站点不吻合时候才需要提示
				if(result.returnCode == 0 && result.country && window.digitalData.page.pageInfo.countryCode != result.country){
					buildPromptRegion(result.country);
				}
			}
		})
	})

	/**
	 拼接弹框显示的html内容
	 **/
	window.buildPromptRegion = buildPromptRegion;
	function buildPromptRegion(regionCode){
	    // 获取国家信息
	    var data = getIpLocationRegionData()
	    if ($.isEmptyObject(data)) {
	        return;
	    }

        var showRegionArr = getShowRegionValue(data, regionCode);
	    if (!showRegionArr || showRegionArr.length == 0) {
	        return;
	    }

		var regionHtml = "";
		regionHtml += '<span class="ipJump-close"></span>';
		regionHtml += '<div class="ipJump-cnt">';
			regionHtml += '<div class="ipJump-copywriting">'+ showRegionArr[0].message +'</div>';
			regionHtml += '<div class="ipJump-bnt clearfix">';
				regionHtml += '<div class="ipJump-select">';
					regionHtml += '<span class="ipJump-select-title">'+ showRegionArr[0].siteName +	'</span>';
					regionHtml += '<ul class="clearfix">';
						for(var j=0; j< showRegionArr.length;j++){
							regionHtml += '<li path="'+showRegionArr[j].path+'" siteName="'+showRegionArr[j].siteName+'">'+ showRegionArr[j].siteName +'</li>';
						}
						//other country
						regionHtml += '<li class="other-region" path="en" siteName="'+showRegionArr[0].selectText+'">'+ showRegionArr[0].selectText +'</li>';
					regionHtml += '</ul>';
				regionHtml +='</div>';
				regionHtml +='<a class="ip-jump-go" href="javascript:;" message="' + showRegionArr[0].message +
					'" buttonText="'+ showRegionArr[0].buttonText +'" path="'+showRegionArr[0].path + '"  >'+showRegionArr[0].buttonText+'</a>';
			regionHtml +='</div>';
		regionHtml +='</div>';

		//填充html
		$(".ip-jump-wrap").html(Mkt.Util.filterText(regionHtml)).show();

		// 适配各页面UI
		adaptPageUI();
	}

	function getShowRegionValue(data, regionCode) {
	    var countryListMap = new Map();
	    var array;
	    if (data.countries && data.countries.length > 0) {
            $.each(data.countries, function (i, obj) {
                var sites = countryListMap.get(obj.code.trim());
                if($.isEmptyObject(sites)) {
                    array = [];
                    array.push(obj);
                    countryListMap.set(obj.code.trim(), array);
                } else {
                    sites.push(obj);
                    countryListMap.set(obj.code.trim(), sites);
                }
            });
	    }

        var showRegionArr = [];
	    var value = countryListMap.get(regionCode.trim());
	    if (value && value.length > 0) {
	        //独立站点，双语站点，或是镜像站点
	        showRegionArr = value;
	    } else {
            var areaSites = data.areaSites;
            var areaRegionCode;
	        if (areaSites && areaSites.length > 0) {
                for(var i=0; i< areaSites.length; i++){
                    if(areaSites[i].countryCodes && areaSites[i].countryCodes.indexOf(regionCode.trim()) != -1){
                        areaRegionCode = areaSites[i].regionCode;
                        break;
                    }
                }
            }

	        if(areaRegionCode) {
	            // 查找片区数据（片区所属code拿到后，需在对象countries中查找数据）
	            showRegionArr = countryListMap.get(areaRegionCode.trim());
	        } else {
	            //官网无覆盖地区，显示默认数据
                if (data.defaultInfo) {
                    showRegionArr.push(data.defaultInfo);
                } else {
                    console.log("defaultInfo对象未配置！");
                }
	        }
	    }
	    return showRegionArr;
	}

	function getIpLocationRegionData() {
        var getIpLocationRegionListApi = '/content/dam/huawei-cbg-site/en/worldwide/js/ip-location-region-data.json';
        var data = {};
        $.ajax({
            url: getIpLocationRegionListApi,
            async:false,
            type: "GET",
            success:function (result){
                if(result){
                    data = result;
                }
            }
        });
        return data;
	}

	// ip定位各类事件绑定
	$(".ip-jump-wrap").on("click",".ipJump-select",function(){
		if($(".ipJump-select ul").is(":visible")) {
			$(this).removeClass("active");
		}else {
			$(this).addClass("active");
		}
	})

	$(window).on('scroll', ()=> {
		if($(".ipJump-select ul").is(":visible")){
			$('.ip-jump-wrap .ipJump-select').removeClass('active');
		}
	});

	$(".ip-jump-wrap").on("click","ul li",function(){
		var obj = $(this);
		$(".ip-jump-wrap .ipJump-select-title").text(obj.attr("siteName"));
		$(".ip-jump-wrap .ip-jump-go").attr("path",obj.attr("path"));
	})

	$(".ip-jump-wrap").on("click", ".ip-jump-go",function(){
		var obj = {
			event: "ipPop-up",
			buttonName:"go",
			countryCode:sysConfig.countryCode,
			clickName: "ip relocate_click go " + sysConfig.countryCode
		};
		var url = null;
		window.dataLayer.push(obj);
		if($(this).attr("path") == "en"){
			if(location.href.indexOf("/content/huawei-cbg-site/") != -1){
				location.href = Mkt.Util.getSafeUrl(location.origin+"/content/huawei-cbg-site/en/worldwide.html");
				url = Mkt.Util.getSafeUrl(location.origin+"/content/huawei-cbg-site/en/worldwide.html");
			}else{
				location.href = Mkt.Util.getSafeUrl(location.origin+"/en/worldwide/");
				url = Mkt.Util.getSafeUrl(location.origin+"/en/worldwide/");
			}
		}else{
			//设置cookie
			redirectToRegionHref($(this).attr("path"));
			url = $(this).attr("path");
		}
		dmpaCommon("trackEvent", "click", "ip relocated pop-up interaction","go", url);
	});

	//关闭按钮
	$(".ip-jump-wrap").on("click",".ipJump-close",function(){
		var obj = {
			event: "ipPop-up",
			buttonName:"close",
			clickName : "ip relocate_click close " + sysConfig.countryCode,
			clickType : "navigation"
		};
		window.dataLayer.push(obj);
		dmpaCommon("trackEvent", "click", "ip relocated pop-up interaction","close", '');

		$(".ip-jump-wrap").hide();
		setPromoteRegionCheck();

		// 适配各页面UI
		adaptPageUI();
	});

	/*
	* 适配各页面UI
	*/
	function adaptPageUI(){
		var headerHeight = $header.innerHeight();
		var holderH = 0;
		if($("#locationSecret").is(':visible')) {
			// 服务店查询页 且 含有地理位置定位弹窗UI 适配
			var locationH = $('#locationSecret').height();
			$header.css('top',locationH);

			holderH = locationH + headerHeight;
		}else {
			// 其他页适配
			$header.toggleClass("hasIp");
			$(".page-plp").toggleClass("hasIp");
			$(".product-filter__inner--fixed").css("top",headerHeight);

			holderH = headerHeight;
		}

		$headerPlaceHolder.css({"height":holderH});
		$headerSearch.css("top",holderH);
		$('.huawei-forum .forum-navigation-cmponent').css("top",holderH);

		// 主导航UI适配（注意区分v1和v2版本）
		if(Mkt.Util.windowWidth() >= uiBoundaryVal && !$header.hasClass('mb-ui')) {
			// PC端UI
			$mainNavPopup.css("top",headerHeight);
		}else {
			// 移动端UI
			$mainNavContent.css("top",holderH);
			$login.css("top",holderH);
		}
		if($header.hasClass('v5-style')){
			if((Mkt.Util.windowWidth() > 1079 && Mkt.Util.windowWidth() < uiBoundaryVal) || ($header.hasClass('mb-ui'))) {
				var platformBottom = window.innerHeight - headerHeight - $('.v5-style .main-nav-wrap').height() - $('.platform-selection__toggle').height();
				$('.n04-platform-selection').css('bottom', platformBottom);
			}
		}
	}

	//获取跳转地址
	function redirectToRegionHref(regionCode){
		var defaultTargetUrl =  location.origin+"/"+regionCode.toLowerCase()+"/";
		var current_site_code = digitalData.page.pageInfo.siteCode2 || '';//当前站点编码
		var path_name = location.pathname;
		var targetUrl = "";
		if(path_name.indexOf(CBG_SITE_EDITOR_ROOT) == 0){
			//编辑模式
			return;
		}else if (path_name.indexOf(CBG_SITE_ROOT) == 0){
			//author预览模式
			path_name = path_name.replace(CBG_SITE_ROOT, "");
			if (path_name.indexOf("/") > -1) { //非首页，
				targetUrl = location.origin + location.pathname.replace("/"+current_site_code+"/", "/"+regionCode.toLowerCase()+"/");
			} else { //首页，
				targetUrl = location.origin + location.pathname.replace("/"+current_site_code+".html", "/"+regionCode.toLowerCase()+".html");
			}
		}else{
			targetUrl = location.origin + location.pathname.replace("/"+current_site_code+"/", "/"+regionCode.toLowerCase()+"/");
		}

		$.ajax({
			type: 'get',
			cache: false,
			url:  Mkt.Util.filterText(targetUrl+location.search),
			dataType: 'html',
			complete: function (data) {
				if (data.status == 404) {//如果页面不存在，不做强制跳转
					location.href = defaultTargetUrl;
				}else{//否则页面强制重定向跳转
					location.href = Mkt.Util.filterText(targetUrl+location.search);
				}
			}
		})
	}

	//判断是否区域站点
	function  getAreaSite(regionCode){
		switch(regionCode){
			case "LB":
				regionCode = "LEVANT"; break;
			case "JO":
				regionCode = "LEVANT"; break;
			case "IQ":
				regionCode = "LEVANT"; break;
			case "GT":
				regionCode = "LATIN"; break;
			case "DO":
				regionCode = "LATIN"; break;
			case "UY":
				regionCode = "LATIN"; break;
			case "EC":
				regionCode = "LATIN"; break;
			case "BO":
				regionCode = "LATIN"; break;
			case "HN":
				regionCode = "LATIN"; break;
			case "PY":
				regionCode = "LATIN"; break;
			case "VE":
				regionCode = "LATIN"; break;
			case "CR":
				regionCode = "LATIN"; break;
			case "SV":
				regionCode = "LATIN"; break;
			case "NI":
				regionCode = "LATIN"; break;
			case "jM":
				regionCode = "LATIN"; break;
			default:
				break;
		}
		return regionCode;
	}

	//设置cookie
	function setPromoteRegionCheck(regionCode){
		$.cookie("checkRegion","true", {path:"/", expires:7});
	}

	/**
	 * 判断是否西欧站点
	 * @param region
	 * @returns
	 */
	function isWeuSite(regionCode){
		var weuSiteArr = ["UK","GB","IT","ES","FR","DE","NL","BE","CH","IE","PT","AU"];
		return weuSiteArr.indexOf(regionCode) > -1 ;
	}

}());
(function(Mkt){
    "use strict";

    Mkt.Constants = (function(){

        var self = {};

        self.SITE_ROOT_PATH = "/content/huawei-cbg-site/";
        
        return self;

    }());

}(Mkt));
(function ($, Mkt) {
    "use strict";

    let __internalHaSdk = null;
    let hasExeued = false;
    let __haDataLayer = [];

    Mkt.Util = (function(){

        var SITE_ROOT_PATH = Mkt.Constants.SITE_ROOT_PATH;
        /* 当前未用到，为了保持扩展性暂时注释
        var SLASH = "/";
        var HTML_EXTENSION = ".html";
        */

        var self = {};

        self.isEditMode = location.pathname.indexOf("/editor.html/") != -1;

        self.isPreviewMode = location.pathname.indexOf(SITE_ROOT_PATH) != -1;

        self.isDispatcher = location.pathname.indexOf(SITE_ROOT_PATH) == -1;

        self.isIE = !!window.ActiveXObject || "ActiveXObject" in window;

        self.isAppWebview = window.integrationJsInterface || window.integrationJsInterfaceWebview;

        /**
         * Call AEM Servlet(resourceType="/apps/huawei-cbg-site/components/page/base-page") by servlet selector.
         * @param servletSelector: AEM servlet selector
         * @param params: request parameters
         * @param async: specify a async request or not, default is true
         * @return return a Promise object
         */
        self.callAEMServletBySelector = function (servletSelector, async, params) {
            var def = $.Deferred();
            var serviceUrl = window.location.origin + servletSelector;
            $.ajax(
                serviceUrl, {
                    async: async,
                    dataType: "json",
                    data: Mkt.Util.filterText(params),
                    success: function (response) {
                        def.resolve(response);
                    },
                    error: function (xhr) {
                        var errorData = {};
                        errorData.message = "Call AEM servlet fail, please check the servlet detail";
                        errorData.servletDetail = xhr.responseText;
                        def.reject(errorData);
                    }
                });

            return def.promise();
        };

        /**
         * 删除字符串前后空格
         * 如果对象不为字符串会被转成字符串，
         * 如果是undefined或者null结果会变为空串
         * @param obj
         * @returns {string}
         */
        self.trim = function (obj) {
            if(typeof obj == "undefined" || obj == null){
                return "";
            }
            else {
                return ("" + obj).trim();
            }
        }


        /* 设置cookie
         * @param {string} name：名称
         * @param {string} val:值
         * @param {string} domain:域名
         * @param {string} path: 指定可以访问的路径
         * @param {number} day:天数
         * @param {number} hour:小时数
         * @param {number} minute:分钟数
         */
        self.setCookie = function (name, val, domain, path, day, hour, minute) {
            domain = domain || '.huawei.com';
            path = path || '/';
            day = day || 0;
            hour = hour || 0;
            minute = minute || 0;
            if (day === 0 && hour === 0 && minute === 0) {
                window.document.cookie = name + "=" + val + ";domain=" + domain + ";path=" + path;
            } else {
                let exp = new Date();
                let allTime = (day * 24 + hour) * 60 + minute;
                exp.setTime(exp.getTime() + allTime * 60 * 1000);
                window.document.cookie = name + "=" + val + ";domain=" + domain + ";path=" + path + ";expires=" + exp.toGMTString();
            }
        };

        // 获取cookie
        self.getCookie = function (name) {
            var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
            if (arr = document.cookie.match(reg)) {
                return arr[2];
            } else {
                return null;
            }
        };

        /* 清除cookie
         * @param {string} name：名称
         * @param {string} domain:域名
         */
        self.clearCookie = function (name, domain) {
            var exp = new Date();
            exp.setTime(exp.getTime() - (24 * 60 * 60 * 1000));
            window.document.cookie = name + "= " + ";expires=" + exp.toGMTString() + ";domain=" + domain + ";path=/";
        };

        // 当前页面宽度
        self.pageWidth = function () {
            return document.body.scrollWidth;
        };

        // 当前页面高度
        self.pageHeight = function () {
            return document.body.scrollHeight;
        };

        // 浏览器视口的宽度
        self.windowWidth = function () {
            var de = document.documentElement;
            return window.innerWidth || (de && de.clientWidth) || document.body.clientWidth
        };

        // 浏览器视口的高度
        self.windowHeight = function () {
            var de = document.documentElement;
            return window.innerHeight || (de && de.clientHeight) || document.body.clientHeight;
        };

        // 浏览器水平滚动位置
        self.scrollX = function () {
            var de = document.documentElement;
            return window.pageXOffset || (de && de.scrollLeft) || document.body.scrollLeft;
        };

        // 浏览器垂直滚动位置
        self.scrollY = function () {
            var de = document.documentElement;
            return window.pageYOffset || (de && de.scrollTop) || document.body.scrollTop;
        };

        //判断访问终端
        self.endBrowser = function () {
            var u = navigator.userAgent;
            return {
                trident: u.indexOf('Trident') > -1, //IE内核
                presto: u.indexOf('Presto') > -1, //opera内核
                webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
                gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
                mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或者uc浏览器
                iPhone: u.indexOf('iPhone') > -1, //是否为iPhone或者QQHD浏览器
                iPad: u.indexOf('iPad') > -1, //是否iPad
                webApp: u.indexOf('Safari') == -1, //是否web应该程序，没有头部与底部
                weixin: u.indexOf('MicroMessenger') > -1, //是否微信
                qq: u.match(/\sQQ/i) == " qq" //是否QQ
            };
        };

        // 判断是否是移动端
        self.isMobileEnd = function () {
            return self.endBrowser().mobile || self.endBrowser().android || self.endBrowser().ios;
        };

        // 阻止事件冒泡
        self.stopBubble = function (e) {
            //如果提供了事件对象，则这是一个非IE浏览器
            if (e && e.stopPropagation) {
                //因此它支持W3C的stopPropagation()方法
                e.stopPropagation();
            } else {
                //否则，我们需要使用IE的方式来取消事件冒泡
                window.event.cancelBubble = true;
            }
        };

        //阻止浏览器的默认行为
        self.stopDefault = function (e) {
            //阻止默认浏览器动作(W3C)
            if (e && e.preventDefault) {
                e.preventDefault();
            } else {
                //IE中阻止函数器默认动作的方式
                window.event.returnValue = false;
            }
            return false;
        };

        /**
         * Base64转file
         * @param base64 String base64格式字符串
         */
        self.dataURLtoFile = function (base64) {
            var arr = base64.split(',') //去掉base64格式图片的头部
            var mime = arr[0].match(/:(.*?);/)[1];
            var bstr = atob(arr[1]) //atob()方法将数据解码
            var leng = bstr.length;
            var u8arr = new Uint8Array(leng);
            var fileName = new Date().getTime() + '.png';
            while (leng--) {
                u8arr[leng] = bstr.charCodeAt(leng); //返回指定位置的字符的 Unicode 编码
            }
            return new File([u8arr], fileName, {
                type: mime
            })
        };

        // 获取url中传递的参数并解码
        self.getRequest = function () {
            var url = location.search;
            var theRequest = new Object();
            if (url.indexOf("?") != -1) {
                var str = url.substr(1);
                var strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = decodeURI(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        };

        // 获取当前页面 主url
        self.getCurrPageUrl = function () {
            return window.location.protocol + '//' + window.location.host;
        };

        /**
         * 功能： 校验邮件地址：
         * 规则：默认邮件的前缀、后缀不以'_'、'-'、'.'结尾
         */
        self.checkEmail = function(email) {
            var reg = /^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z]{2,4}$/;
            return reg.test(email);
        };

        /**
         * 邮箱匿名
         * Vmall规则：显示一半，另一半*号处理
         */
        self.emailHide =  function (email) {
            if (self.isEmpty(email)) {
                return "";
            }
            var emailArr = email.split("@");
            if (emailArr[0].length > 1) {
                var halfVal = parseInt(emailArr[0].length / 2);
                var reg = new RegExp(".", 'g');
                var asterisk = emailArr[0].replace(reg, "*");
                var _showEmail = emailArr[0].substring(0, halfVal) + asterisk.substring(halfVal, emailArr[0].length);
                return _showEmail + "@" + emailArr[1];
            } else {
                return "*@" + emailArr[1];
            }

        };

        /*
         * 节流函数
         * @param {Function} fn 需要节流的函数
         * @param {Number} _delay 节流的时间（默认100ms）
         * @returns {Function} 返回节流后的函数
         */
        self.mktThrottle = function (fn, _delay) {
            if (typeof fn !== 'function') {
                return;
            }

            var ctx,
                args,
                delay = _delay || 100,
                previous = Date.now(),
                later = function () {
                    fn.apply(ctx, args);
                };

            return function () {
                ctx = this;
                args = arguments;

                var now = Date.now(),
                    diff = now - previous - delay;

                if (diff >= 0) {
                    previous = now;
                    setTimeout(later, delay);
                }
            };
        };

        /**
         * 对函数进行防抖
         * @param func {function} 需要防抖的函数
         * @param _delay {number | undefined} _delay 防抖的时间
         * @param _immediate { boolean | undefined} 是否立即执行
         * @returns {(function(): void)|*}
         */
        self.mktDebounce = function(func, _delay, _immediate) {
            let immediate = typeof _immediate === 'boolean' ? _immediate : false;
            let delay = _delay || 100;

            return function (...args) {
                if (typeof func !== 'function') return;

                let ctx = this;

                clearTimeout(func.__id);

                if (immediate && !func.__id) {
                    (!func.__id) && func.apply(ctx, args);

                    func.__id = setTimeout(function () {
                        func.__id = null;
                    }, delay);
                } else {
                    func.__id = setTimeout(function () {
                        func.apply(ctx, args);
                    }, delay);
                }
            }
        }


        /*
        * 封装常用图片懒加载
        *
        * 说明：
        * 1. 基于jQuery & Zepto Lazy v1.7.11懒加载插件
        * 2. 当前只针对的图片元素进行懒加载
        *
        * 图片懒加载交互过程：
        * 1. 初始时图片隐藏，图片位置区域保留；
        * 2. 图片执行懒加载操作，未配置图片资源的直接替换为占位图；已配置图片资源的加载成功则显示，失败则替换为占位图。
        * @param $obj 当前图片对象
        * @param type loading图类型：
        * 1. 'sm':默认值，对应80x80px图片
        * 2. 'lg':对应200x200px图片
        *
        * @param scrollObj:滚动对象
        * @param finishCallback: 懒加载完成的回调方法
        *
        * */
        self.imgLazyLoad = function ($obj,type,threshold,scrollObj,finishCallback){
            var loadingImg = '/etc/designs/huawei-cbg-site/clientlib-v3/images/hw-logo1-80.png';
            if(type === 'lg'){
                loadingImg='/etc/designs/huawei-cbg-site/clientlib-v3/images/hw-logo1-200.png'
            }
            // 未配置图片资源，懒加载交互
            $obj.each(function (){
                var hasDataSrc = $(this).attr('data-src');
                var hasSrc = $(this).attr('src');
                if(!hasDataSrc && !hasSrc){
                    $(this).attr('src',loadingImg).addClass('show error-img');
                }
            })
            // 已配置图片资源，懒加载
            $obj.Lazy({
                appendScroll: scrollObj || window,
                defaultImage:loadingImg,
                threshold: threshold || (1.2 * self.windowHeight()),//默认1.2倍视口高度
                afterLoad: function(element) {
                    // 加载成功
                    $(element).addClass('show success-img');
                },
                onError: function(element) {
                    // 加载失败
                    $(element).addClass('show error-img');
                },
                onFinishedAll:function (){
                    finishCallback && finishCallback();
                }
            });
        };

        /*
        * 封装组件上下边距方法
        * @param $obj 获取和赋值上下内边距对象
        * */
        self.configPadding = function($obj) {
            $obj.each(function() {
                if (window.innerWidth > 768) {
                    const pcPaddingTop = $obj.attr('data-pcmargintop');
                    const pcPaddingBottom = $obj.attr('data-pcmarginbottom');
                    $obj.css("padding-top", pcPaddingTop + 'px');
                    $obj.css("padding-bottom", pcPaddingBottom + 'px');
                } else {
                    const mobPaddingTop = $obj.attr('data-mobmargintop');
                    const mobPaddingBottom = $obj.attr('data-mobmarginbottom');
                    $obj.css("padding-top", mobPaddingTop + 'px');
                    $obj.css("padding-bottom", mobPaddingBottom + 'px');
                }
            })
        }

        /**
         * @description 功能：封装Ajax
         * @param {string} params.api 接口
         * @param {boolean} params.isCookie 是否传cookie
         * @param {boolean} params.type 请求方式，get,post等
         * @param {boolean} params.data 接口参数对象,其中siteCode自动获得
         * @param {boolean} loading 加载中方法 function(val){ switch case start case end}
         */
        self.ajaxReq = function(params, loading) {
            var def = $.Deferred();
            var _apiHost = apiHost;
            if (!params.api) {
                return;
            }
            if (loading) {
                loading("start");
            }
            if (params.apiHost) {
                _apiHost = params.apiHost;
            }

            var responseData = {};
            // 暂不进行电商接口文根切换，新增接口暂时使用代码替换文根(切换后请移除此段代码） 2022-09-27
            if (params.api === 'queryMinPriceSku') { // start
                _apiHost = _apiHost.replace('/eCommerce/', '/convert/product/');
            } // end

            // 电商站点时，产品价格数据接口替换文根
            if (params.api === 'queryMinPriceAndInv') {
                _apiHost = _apiHost.replace('/eCommerce/', '/convert/');
            }
            var url = _apiHost + params.api;
            var dataParams = params.data ? params.data : {};
            var type = params.type ? params.type : "post";
            var cache = params.cache ? params.cache : false;
            var async = params.async != false;

            var siteCode = window.digitalData ? window.digitalData.page.pageInfo.siteCode2 : '';
            dataParams.siteCode = siteCode.toUpperCase();
            dataParams.loginFrom = "1";//后台要求添加订单来源标识(1:华为官网，0默认值)
            type = type.toLowerCase();
            if (type == "post") {
                dataParams = JSON.stringify(dataParams);
            }

            $.ajax({
                url        : url,
                type       : type,
                cache      : cache,
                data       : dataParams,
                dataType   : "json",
                traditional: true, //防止深度序列化
                async      : async,
                xhrFields  : {
                    withCredentials: params.isCookie ? params.isCookie : true
                },
                crossDomain: true,
                contentType: type == "get" ? "text/plain" : "application/json",
                success    : function(data, status, request) {
                    if (params.success) {
                        params.success(data);
                    }
                    if (async) {
                        if (data.resultCode == 1010002) {// ecToken 报错处理
                            def.reject(data);
                        }
                        if (loading) {
                            loading("end");
                        }
                        def.resolve(data);
                    } else {
                        responseData = data;
                    }
                },
                error: function(xhr, status, error) {
                    if (async) {
                        if (params.error) params.error(xhr);
                        if (loading) {
                            loading("end");
                        }
                        self.handleAjaxError(xhr);
                        def.reject(xhr);
                    } else {
                        self.handleAjaxError(xhr);
                    }
                }
            });
            if (!async) {
                return responseData;
            }
            return def.promise();
        };

        /**
         * @description ajax请求错误处理
         * @param {*} xhr
         */
        self.handleAjaxError = function (xhr) {
            if (xhr && xhr.status == 403) {
                console.error("Session timeout, please refresh the page and try again!");
            }
        };
        /**
         * 处理超长文案
         * @param row 显示的行数
         * @param char 多余文案用char替换
         * @param $dom 需要处理的dom元素
         */
        self.solveTextEllipsis = function (row, char, $dom) {
            $dom.each(function() {
                var $this = $(this);
                var text = $this.text();
                var originalHeight = $this.height();

                // 计算一行文案的高度
                $this.text('a');
                var lineHeight =  parseFloat($this.css("lineHeight"), 10);
                var rowHeight = $this.height();
                var gapHeight = lineHeight > rowHeight ? (lineHeight - rowHeight) : 0;
                var targetHeight = gapHeight * (row - 1) + rowHeight * row;
                if (originalHeight <= targetHeight) {
                    $this.text(text);
                    return;
                }
                var start = 1;
                var length = 0;
                var end = text.length;
                while (start < end) {
                    length = end;
                    $this.text(text.slice(0, length) + char);
                    if ($this.height() <= targetHeight) {
                        start = length;
                    } else {
                        end = length - 1;
                    }
                }
                text = text.slice(0, start);
                text += char;
                $this.text(text);
            });
        };

        /**
         * 使用到的媒体查询断点
         * @param {Object | Array } breakpoints 媒体查询数组
         * @callback callback 需要监听的函数
         * @return {Object} currentBreakpoint匹配到的断点 destroy()消除监听事件
         */
        self.useMediaBreakpoint = function (breakpoints, callback) {
            var currentBreakpoint = null;
            var mediaQueries = breakpoints.map(function (breakpoint) {
                return {
                    query: window.matchMedia(breakpoint),
                    breakpoint: breakpoint
                };
            });
            function handleMediaChange(mq) {
                if (mq.matches) {
                    currentBreakpoint = mq.media;
                    if (callback) {
                        callback(currentBreakpoint);
                    }
                }
            }
            function initialize() {
                mediaQueries.forEach(function (mq) {
                    if (mq.query.matches) {
                        currentBreakpoint = mq.breakpoint;
                        if (callback) {
                            callback(currentBreakpoint);
                        }
                    }
                    mq.query.addEventListener('change', function () {
                        handleMediaChange(mq.query);
                    });
                });
            }

            function cleanup() {
                mediaQueries.forEach(function (mq) {
                    mq.query.removeEventListener('change', function () {
                        handleMediaChange(mq.query);
                    });
                });
            }

            initialize();

            return {
                get currentBreakpoint() {
                    return currentBreakpoint;
                },
                destroy: cleanup
            };
        };

        /**
         * 匹配媒体查询断点
         * @param {String} mediaBreakpoint 需要匹配的媒体查询断点
         * @callback callback 需要监听的函数
         * @return {Object} inBreakpoint是否匹配到对应的媒体断点 destroy()消除监听事件
         */
        self.useMatchMedia = function (mediaBreakpoint, callback) {
            var mediaQuery = window.matchMedia(mediaBreakpoint);

            var inBreakpoint = mediaQuery.matches;

            function handleMediaChange(event) {
                inBreakpoint = event.matches;
                if (callback) {
                    callback(inBreakpoint);
                }
            }

            mediaQuery.addEventListener('change', handleMediaChange);

            return {
                get inBreakpoint() {
                    return inBreakpoint;
                },
                destroy: function () {
                    mediaQuery.removeEventListener('change', handleMediaChange);
                }
            };
        };

        /**
         * 计算【价格信息】【分期信息】【划线价】内容是否换行，如果换行则行高为1.6，否则行高为1.25
         * @param wrapperElement
         * @param cb
         * @returns {{originLineHeightRatio, isMultiLines: boolean}|*}
         */
        self.calcAndSetLineHeight = function (wrapperElement, cb) {
            if(!wrapperElement) {
                return null;
            }

            const isCbFunc = typeof cb === 'function';
            const computedWrapperEleStyle = window.getComputedStyle(wrapperElement);
            const paddingTop = parseFloat(computedWrapperEleStyle.paddingTop) || 0;
            const paddingBottom = parseFloat(computedWrapperEleStyle.paddingBottom) || 0;
            const contentHeight = (wrapperElement.clientHeight || wrapperElement.offsetHeight) - paddingTop - paddingBottom;

            function calcLineHeight (containerEle){
                const children = containerEle.children;
                const newArr = children.length ? children : [containerEle];

                for (let i = 0; i < newArr.length; i++) {
                    const childEle = newArr[i];
                    const computedStyle = window.getComputedStyle(childEle);
                    const fontSize = parseFloat(computedStyle.fontSize) || 0;

                    if (fontSize > 0) {
                        let lineHeight = parseFloat(computedStyle.lineHeight) || (1.25 * 12);
                        let isMultiLines = (contentHeight / lineHeight) > 1.9;
                        let originLineHeightRatio = lineHeight / fontSize;
                        let newLineHeightRatio = isMultiLines ? 1.6 : 1.25;

                        if (newLineHeightRatio !== originLineHeightRatio) {
                            wrapperElement.style.setProperty('line-height', newLineHeightRatio);
                            isCbFunc && setTimeout(() => cb());
                        }

                        return {
                            originLineHeightRatio: originLineHeightRatio,
                            isMultiLines: isMultiLines
                        }
                    }

                    const nestedResult = calcLineHeight(childEle);

                    if (nestedResult) {
                        return nestedResult;
                    }
                }

                return null;
            }

            return calcLineHeight(wrapperElement);
        }

        /**
         * 元素可见性监听，该函数为闭包函数，返回disconnect和reBindEv两个函数
         * @param elOrElList 需要监听的dom、NodeList或HTMLCollection
         * @param _config 监听的配置
         * @param callBack 元素可见性触发的回调，回调函数的入参为触发的dom对象
         * @returns {{}|{disconnect: disconnect, reBindEv: reBindEv}}
         */
        self.elVisibleHandler = function (elOrElList, _config, callBack) {
            let isDom = elOrElList instanceof HTMLElement;
            let elList = isDom ? [elOrElList] : Array.prototype.slice.call(elOrElList);

            if (elList.length === 0) {
                return {};
            }

            const defaults = {
                threshold: 0,
                rootMargin: '0px',
                root: null,
                once: true,
                ignoreTriggeredEl: false
            };
            let observer = null;

            function createHandler(config) {
                if (!elList.length) {
                    return observer;
                }

                let conf = Object.assign({}, defaults);

                if (Object.prototype.toString.call(config) === '[object Object]' && Object.keys(config).length) {
                    Object.assign(conf, config);
                }

                let _isAllElements = typeof conf.ignoreTriggeredEl === 'boolean' ? !conf.ignoreTriggeredEl : true;

                observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.__hasTriggered = true;
                            typeof callBack === 'function' && callBack(entry.target, observer);

                            if (conf.once) {
                                observer.unobserve(entry.target);
                            }
                        }
                    })
                }, {threshold: conf.threshold, root: conf.root, rootMargin: conf.rootMargin});


                elList.length && elList.forEach((el) => {
                    (_isAllElements || (!_isAllElements && !el.__hasTriggered)) && observer.observe(el);
                });

                return observer;
            }

            observer = createHandler(_config);

            return {
                forceClearAllElements: () => {
                    if (elList.length) {
                        observer && elList.forEach((el) => observer.unobserve(el));
                    }

                    elList = [];
                },
                addElIntoList: (ele) => {
                    let isDom = ele instanceof HTMLElement;
                    elList = isDom ? [ele] : Array.prototype.slice.call(ele);
                    observer = createHandler(_config);
                },
                reBindEv: (config) => {
                    observer && observer.disconnect();

                    observer = createHandler(config || _config);
                },
                disconnect: () => observer && observer.disconnect()
            }
        }

        self.pushHaPoint = function (codeSymbol, elType, pointData) {
            if (typeof codeSymbol !== 'string' || typeof elType !== 'string') {
                return;
            }

            let isValidPointData = Object.prototype.toString.call(pointData) === '[object Object]' && Object.keys(pointData).length;

            if (!isValidPointData || typeof buryPointHA !== 'function') {
                return;
            }

            let defaults = {
                url: window.location.href,
                title: document.title
            }

            let haData = Object.assign({}, defaults, pointData);

            window.haDataLayer ||= [];
            window.haDataLayer.push({codeSymbol, elType, haData});

            if(pointData.etype === "exposure" && !window._hasdk && !hasExeued){
                __haDataLayer.push({codeSymbol, elType, haData});

                Object.defineProperty(window, '_hasdk', {
                    configurable: true,
                    enumerable: true,
                    get() {
                        return __internalHaSdk;
                    },
                    set(newValue) {
                        if (newValue != null) { // 判断是否“有值”
                            __internalHaSdk = newValue;
                            __haDataLayer.forEach((dataPoint)=>{
                                buryPointHA(dataPoint.codeSymbol, dataPoint.elType, dataPoint.haData);
                            });

                            __haDataLayer = [];
                            hasExeued = true;
                        }
                    }
                });

                hasExeued && buryPointHA(codeSymbol, elType, haData);
            }else{
                buryPointHA(codeSymbol, elType, haData);
            }
        }
        /**
         * 替换对象里的字符串
         *
         * @param obj
         */
        self.filterObject = function (obj,reg) {
            try {
                let replaceReg = reg || /^\\s+|\\s+$/g;
                const filterObj = Array.isArray(obj) ? [] : {};

                // 遍历对象的每个属性
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        const value = obj[key];
                        if (typeof value === "object" && value !== null) {
                            filterObj[key] = self.filterObject(value,replaceReg);
                        } else {
                            if (value && typeof value === "string") {
                                filterObj[key] = self.filterText(value,replaceReg);
                            } else {
                                filterObj[key] = value;
                            }
                        }
                    }
                }

                return filterObj;
            } catch (e) {
                return obj;
            }
        }
        /**
         * 获取链接是否安全
         *
         * @param url
         * @returns {String}
         */
        self.getSafeUrl = function (url) {
            try {
                let requestUrl = new URL(url);
                if (requestUrl.protocol === 'http:' || requestUrl.protocol === 'https:') {
                    return url;
                }
                return url;
            } catch (e) {
                return url;
            }
        }

        /**
         * 替换字符串
         *
         * @param text
         */
        self.filterText = function (text,reg) {
            try {
                let replaceReg = reg || /^\\s+|\\s+$/g;
                return text.replace(replaceReg, '');
            } catch (e) {
                return text;
            }
        }

        /**
         * 经过防抖处理的触发resize,防抖时间150ms
         * @type {(function(): void)|*}
         */
        self.debounceTriggerResize = self.mktDebounce( () => {
            window.dispatchEvent(new Event('resize'));
        },150, false);

        self.header = (function () {
            const headerV6 = document.querySelector(".header.site-header");
            const headerV4 = document.getElementById("header-v4");
            let header = headerV6 || headerV4;
            let themeClass = {
                dark: "theme-dark",
                light: "theme-light",
            };
            if (headerV4) {
                themeClass = {
                    dark: "dark",
                    light: "light",
                };
            }

            return {
                // el: 当前版本的 header DOM 元素
                el: header,
                /**
                 * 切换或设置 header 的主题样式
                 * @param {string} theme - 可选。指定要切换到的主题，值为 'dark' 或 'light' 如果未传入，则自动在当前主题之间切换
                 */
                toggleTheme: function (theme) {
                    let targetTheme = theme;
                    if (!targetTheme) {
                        if (header.classList.contains(themeClass["dark"])) {
                            targetTheme = "light";
                        } else {
                            targetTheme = "dark";
                        }
                    }
                    if (targetTheme === "dark") {
                        header.classList.remove(themeClass["light"]);
                        header.classList.add(themeClass["dark"]);
                    }
                    if (targetTheme === "light") {
                        header.classList.remove(themeClass["dark"]);
                        header.classList.add(themeClass["light"]);
                    }
                },
            };
        })();

        return self;

    }());

}(jQuery, Mkt));
(function ($, Mkt) {
    "use strict";

    Mkt.I18n = (function () {

        var self = {};

        var dict = {};

        var servletSelector = "/libs/cq/website/i18n"
        var expiredTime = 600000  // 10 minuets

        var I18N_SESSION_KEY = "mkt_i18n_";
        var I18N_EXPIRED_SESSION_KEY = I18N_SESSION_KEY + "expired_";

        self.isInit = false;

        self.init = function () {
            // expire i18n in sessionStorage
            var currentDate = new Date().getTime();
            var expiredDate = sessionStorage.getItem(I18N_EXPIRED_SESSION_KEY + self.getLocale());
            if (expiredDate == null || expiredDate == "") {
                setExpiredTime();
            } else {
                if (currentDate >= expiredDate) {
                    sessionStorage.removeItem(I18N_SESSION_KEY + self.getLocale());
                }
            }

            //先从sessionStorage获取i18n值，如果session没有请求获取
            var sessionI18nValues = sessionStorage.getItem(I18N_SESSION_KEY + self.getLocale());
            dict = sessionI18nValues ? JSON.parse(sessionI18nValues) : {};
            if ($.isEmptyObject(dict)) {
                self.initDictionary();
            }
        };

        /**
         * 获取指定站点i18n字典
         */
        self.initDictionary = function () {
        	servletSelector = servletSelector + "." + self.getLocale() + ".json";
            Mkt.Util.callAEMServletBySelector(servletSelector, false).done(
                function(response) {
                    //国际化存储到sessionStorage
                    sessionStorage.setItem(I18N_SESSION_KEY + self.getLocale(), JSON.stringify(response));
                    dict = response;
                    setExpiredTime();
                }
            );
        };

        /**
         * 根据i18n key获取当前站点对应value
         *
         * @param key: i18n key
         * @param snippets: 填充文本（可传入数组）
         * @returns 当前站点i18n value，若无则返回key
         */
        self.get = function (key, snippets) {
            if(!self.isInit){
                self.init();
                self.isInit = true;
            }
            var value = dict[key];
            if (!value) {
                value = key;
            }
            return self.patchText(value, snippets);
        }

        /**
         * 获取当前站点语言
         */
        self.getLocale = function () {
        	return window.digitalData.page.pageInfo.language;
        };

        /**
         * 填充文本中的占位符{}
         * @example
         *   var text = ECommerce.I18n.patchText("{0} is coming", "Tyrion"); text = "Tyrion is coming"
         *   var text = ECommerce.I18n.patchText("{0} has {1} houses", ["Tyrion", 3]); text = "Tyrion has 3 houses"
         */
        self.patchText = function (text, snippets) {
            if (snippets || snippets == "0") {
                if (Array.isArray(snippets)) {
                    for (var i = 0; i < snippets.length; i++) {
                        text = text.replace("{" + i + "}", snippets[i]);
                    }
                } else {
                    text = text.replace("{0}", snippets);
                }
            }
            return text;
        };

        var setExpiredTime = function() {
            var expiredDate = new Date(new Date().getTime() + expiredTime);
            sessionStorage.setItem(I18N_EXPIRED_SESSION_KEY + self.getLocale(), expiredDate.getTime());
        };

        return self;
    }());
}(jQuery, Mkt));
/*默认设备类型*/
var device = Mkt.Util.windowWidth() < 1024 ? "mobile" : "pc";

var PlpI18n = {
  //购买button按钮翻译文案
  i18n_Buy: "",
  i18n_LearnMore: "",
  i18n_NoPrice: "",
  i18n_from: "",
};
if (window.isECommerceSite && window.isECommerceSite != "None") {
  PlpI18n.i18n_Buy = ecCom.I18n.get("ec_buy");
  PlpI18n.i18n_LearnMore = ecCom.I18n.get("ec_learn_more");
  PlpI18n.i18n_NoPrice = ecCom.I18n.get("ec_no_price");
  PlpI18n.i18n_from = ecCom.I18n.get("ec_from");
}

/**
*接口分期价格处理，获取最小分期对象
*installmentInfos：价格接口返回中的分期列表数据
*/
function getMinInstallmentData(installmentInfos) {
   var hasStaging = null;
  //如果支持分期则拿取相关信息
  if (installmentInfos && installmentInfos.length > 0) {
      //拿到当前sku分期最小值信息
      hasStaging = installmentInfos.sort(function (a, b) {
        return b.num - a.num;
      })[0];
  }
  return hasStaging;
}

var ec_pageLoading_start = function () {
  var loadingHtml =
    '<div id="ec_page_loading" class="ec_page_loading">' +
    '<i class="hsvg60 hsvg-load-ani"></i>' +
    "</div>";
  if ($("#ec_page_loading").length > 0) {
    $("#ec_page_loading").remove();
  }
  $("body").css({
    "overflow-y": "hidden",
  });
  $("body").append(loadingHtml);
};

var ec_pageLoading_end = function () {
  $("#ec_page_loading").remove();
  $("body").css({
    "overflow-y": "auto",
  });
};

/**
* 统一格式化划线价
*/
function getOrderPriceFormatterValue(orderPrice) {
    if (!orderPrice || orderPrice < 0) {
        return;
    }
    var value = ecCurrency(orderPrice);
    // RRP 注释信息
    var tips = "";
    if (rrpTips) {
        tips = '<strong class="rrp-tips"></strong>';
    }

    var valueHtml = "";
    // 是否要展示划线样式
    if (enableScribes) {
        // 显示划线样式
        valueHtml = enableRRP ? '<label style="display:inline-block;cursor: initial;">' + RRPText + '</label>' + '<label style="text-decoration:line-through;cursor: initial;">' + value + tips + '</label>'
                              : '<label style="text-decoration:line-through;cursor: initial;">' + value + '</label>';
    } else {
        // 不显示划线样式
        valueHtml = enableRRP ? '<label style="display:inline-block;">' + RRPText + '</label>' + '<label>' + value + tips + '</label>' : value;
    }
    return valueHtml;
}

/**
 * @description 依照电商配置进行分期信息文本总装
 * @param installmentInfos 分期数据对象集合
 */
function ecInstallmentFullText(installmentInfos) {
    var resultText = '';
    // 取最大分期数分期数据项
    var installmentInfo = installmentInfos.sort(function(a,b){return b.num - a.num})[0];
    var installmentsNum = installmentInfo.num;
    if(enableInstallmentCfg) {
        // 当开启分期显示配置时，依配置进行分期文本组装
        resultText = window.ecInstallmentInfo(installmentInfo);
    }else{
        var payment_installment = ecCom.I18n.get('ec_payment_in_installments', installmentsNum);
        if(site === 'UK' || site === 'DE' || site === 'ES'){
            resultText = ecCom.I18n.get('ec_installment_or') + ' ' + ecCom.I18n.get('ec_finance_available');
        }else{
            resultText = ecCom.I18n.get('ec_installment_or') + ' ' + payment_installment;
        }
    }
    return resultText;
}

/**
 * @description 依照电商配置进行分期信息组装
 * @param installmentInfo 分期数据对象
 */
 function ecInstallmentInfo(installmentInfo) {
    // 俄罗斯ru站，开启免息且商品电商数据支持免息时返回分期免息文本否则返回空字串
    if (window.siteCode === 'ru' && (!enableInterestFree || installmentInfo.installmentFlag != 1)) {
        return '';
    }
    // 返回分期文本
    var resultText = '';
    // 分期左文本('or' 'or from' text)
    var leftText = filterXSS(insatallmentLeftText);
    // 分期右文本('/installment')
    var rightText = filterXSS(insatallmentRightText);
    // 分期数
    var num = installmentInfo.num;
    // 每期还款金额(因业务需求，去除货币符号与价钱之间的空格)
    var amountText = window.ecCurrency(installmentInfo.amount).replaceAll(' ','');
    // 免息文本组装 installmentFlag: 0: 不支持免息 1: 支持免息
    var freeText = filterXSS(enableInterestFree && installmentInfo.installmentFlag == 1 ? ' ' + interestFreeText : '');
    // 判断分期显示类型进行内容组装
    if (installmentDispType) {
        switch (installmentDispType) {
            case 'numberAndAmount':
                resultText = leftText + ' ' + num + ' × ' + amountText + rightText + freeText;
                break;
            case 'amountAndNumber':
                resultText = leftText + ' ' + amountText + ' × ' + num + rightText + freeText;
                break;
            case 'onlyAmount':
                resultText = leftText + ' ' + amountText + rightText + freeText;
                break;
            case 'onlyNumber':
                resultText = leftText + ' ' + num + rightText + freeText;
                break;
            case 'noDisplay':
                break;
            default:
                break;
        }
    }
    return resultText;
};

/**
* 统一格式化销售价
* onePriceDisplay: 是否显示from
*/
function getUnitPriceFormatterValue(unitPrice, onePriceDisplay) {
    if (!unitPrice || unitPrice < 0) {
        return;
    }
    var formattedUnitPrice = ecCurrency(unitPrice);
    if (showFrom && (onePriceDisplay == undefined || !onePriceDisplay)) {
        if (putFromFront) {
            formattedUnitPrice = ecCom.I18n.get('ec_from') + ' ' + formattedUnitPrice;
        } else {
            formattedUnitPrice = formattedUnitPrice + ' ' + ecCom.I18n.get('ec_from');
        }
    }
    return formattedUnitPrice;
}

/**
* 销售价以及对html 片段处理
* unitPrice 最小销售价
* onePriceDisplay: 是否显示from
* $priceDiv 价格显示区域
* removePriceDiv 是否隐藏价格显示区域 true|| false
* powerEfficiencyLabel 能效标签对象 display level pdfFilePath (能效标签)
* installmentDiv 分期信息标签 (能效标签)
*/
function handleUnitPriceForHtml(unitPrice, onePriceDisplay, $priceDiv, removePriceDiv, powerEfficiencyLabel, installmentDiv) {
    var removePriceHtml = removePriceDiv || false;
    if (!unitPrice || unitPrice == 0 ) {
        if (removePriceHtml) {
            $priceDiv.remove();
        }
        return;
    }
    var formattedOrderPrice = getUnitPriceFormatterValue(unitPrice, onePriceDisplay);
    $priceDiv.html(formattedOrderPrice);


    // 能效标签
    if(Object.prototype.toString.call(powerEfficiencyLabel) === '[object Object]'){
        if(String(powerEfficiencyLabel.display) === 'true' && powerEfficiencyLabel.level.length){
            let pdfFilePath = powerEfficiencyLabel.pdfFilePath;
            let level = powerEfficiencyLabel.level.toUpperCase()||'A';
            let direction = $("html").attr("dir") === "rtl" ? 'left' : 'left';
            let imagePath = '/content/dam/huawei-cbg-site/mkt/plp/img-of-level/' + level + '-' + direction + '.svg';
            let powerEfficiencyImgDom = '<div class="mkt-common-pel-img"><img src="'+imagePath+'" data-pdfFilePath="'+pdfFilePath+'"/></div>';
            // 存在分期信息，能效标签就插入到分期信息内，否则插入到价格区域尾部
            setTimeout(()=>{
                let $finallyPriceDom = '';
                if(installmentDiv && $priceDiv.parent().find(installmentDiv).length){
                    $finallyPriceDom = $priceDiv.parent().find(installmentDiv);
                }else{
                    $finallyPriceDom = $priceDiv.parent();
                }
                $finallyPriceDom.append(powerEfficiencyImgDom);
            })
        }
    }
}

/**
* 划线价以及对html 片段处理
* ecProductInfo: 是否显示from
* $priceDiv 价格显示区域
* removePriceDiv 是否隐藏价格显示区域 true|| false
*/
function handleOrderPriceForHtml(ecProductInfo, $priceDiv, removePriceDiv) {
    var removePriceHtml = removePriceDiv || false;
    var minOrderPrice = ecProductInfo.minOrderPrice;
    if (!minOrderPrice || minOrderPrice == 0) {
        if (removePriceDiv) {
            $priceDiv.remove();
        }
        return;
    }

    var minUnitPrice = ecProductInfo.minUnitPrice
    if (minOrderPrice > minUnitPrice) {
        var formattedOrderPrice = getOrderPriceFormatterValue(minOrderPrice);
        $priceDiv.html(formattedOrderPrice);
    }else{
        if (removePriceHtml) {
            $priceDiv.remove();
        }
    }
}

/**
* 分期价以及对html 片段处理
* ecProductInfo: 是否显示from
* $priceDiv 价格显示区域
* removePriceDiv 是否隐藏价格显示区域 true|| false
*/
function handleInstallmentInfosForHtml(ecProductInfo, $priceDiv, removePriceDiv) {
    var removePriceHtml = removePriceDiv || false;
    var installmentInfos = ecProductInfo.installmentInfos;
    if(installmentInfos && installmentInfos.length > 0){
        var installmentText = window.ecInstallmentFullText(ecProductInfo.installmentInfos);
        if (installmentText) {
            $priceDiv.text(installmentText);
        } else {
            if (removePriceHtml) {
                $priceDiv.remove();
            }
        }
    } else {
         if (removePriceHtml) {
            $priceDiv.remove();
        }
    }
}

/**
* 电商站点购买按钮处理
* ecAdminSetting 是否按照admin配置来，不调用接口
* enableEc 产品admin 是否打开电商配置项
* ecProductInfo: 电商接口返回数据
* $buyBtn 购买按钮
*/
function handleBuyButtonTextForECommerceSite(ecAdminSetting, enableEc, ecProductInfo, $buyBtn) {
    // 未找到购买按钮，或是产品开启了电商配置，且开启了admin ecommerce setting，购买按钮按配置显示
    if (!$buyBtn || (enableEc && ecAdminSetting)) {
        // 价格来自admin时候，购买按钮按配置显示
        if ($buyBtn && ecAdminSetting ) {
            if($buyBtn.hasClass("buy-button-hide-v4")) {
                 $buyBtn.removeClass("buy-button-hide-v4");
             }
            $buyBtn.css('display', 'inline-block');
        }
        return;
    }

    if (enableEc && !ecAdminSetting && ecProductInfo && !$.isEmptyObject(ecProductInfo)) {
        var text = ecProductInfo.hasInv ? ecCom.I18n.get("ec_buy"): ecCom.I18n.get("ec_notify_me");
        if ($buyBtn.hasClass("mkt-btn")) {
            let preservedElements = $buyBtn.contents().not(':text'); // 保留非文本节点
            $buyBtn.empty().append(preservedElements).append(text).css('display', 'inline-block');
        } else {
            $buyBtn.html(text).attr("title", text).css('display', 'inline-block');
        }
        //接口有返回数据时，购买按钮文本显示
        if($buyBtn.hasClass("buy-button-hide-v4")) {
            $buyBtn.removeClass("buy-button-hide-v4");
        }
    } else {
        // 接口未返回数据，或产品未开启电商配置时，不显示购买按钮
        $buyBtn.remove();
    }
}

/**
*
* ecProductInfo 接口返回对应产品id数据
* colorName 颜色值
*sku_price.minUnitPrice 销售价
*sku_price.minOrderPrice 划线价，原价
*sku_price.hasStaging 分期信息
*/
function generateProductPriceObj(ecProductInfo, colorName) {
    var sku_price = {};
    if (ecProductInfo && !$.isEmptyObject(ecProductInfo)) {
        var priceByColorsMap = new Map();
        // 接口返回的颜色数据转化为map对象， {colorName: priceValue}
        if (ecProductInfo.minPriceByColors && ecProductInfo.minPriceByColors.length > 0) {
            $.each(ecProductInfo.minPriceByColors, function (i, obj) {
                priceByColorsMap.set(Mkt.Util.trim(obj.color), obj);
            });
        }
        //获取当前产品对应颜色的价格信息
        if (priceByColorsMap != null && priceByColorsMap.size > 0 && colorName && colorName != "") {
            var colorPriceObj = priceByColorsMap.get(Mkt.Util.trim(colorName));
            if (colorPriceObj != null) {
                sku_price.hasStaging = getMinInstallmentData(colorPriceObj.installmentInfos);
                sku_price.minUnitPrice = colorPriceObj.unitPrice;
                sku_price.minOrderPrice = colorPriceObj.orderPrice;
                sku_price.sureDepositPrice = typeof colorPriceObj.sureDepositPrice === 'boolean' ? colorPriceObj.sureDepositPrice : ecProductInfo.sureDepositPrice;
            } else {
                sku_price.hasStaging = getMinInstallmentData(ecProductInfo.installmentInfos);
                sku_price.minUnitPrice = ecProductInfo.minUnitPrice;
                sku_price.minOrderPrice = ecProductInfo.minOrderPrice;
                sku_price.sureDepositPrice = ecProductInfo.sureDepositPrice;
            }
        } else {
            sku_price.hasStaging = getMinInstallmentData(ecProductInfo.installmentInfos);
            sku_price.minUnitPrice = ecProductInfo.minUnitPrice;
            sku_price.minOrderPrice = ecProductInfo.minOrderPrice;
            sku_price.sureDepositPrice = ecProductInfo.sureDepositPrice;
        }
    }
    return sku_price;
}

function handlePriceAndInvMapCallInterface(ecProductIds, isQuerySBomId) {
    var minPriceAndInvList = [];
    if (ecProductIds && ecProductIds.length > 0) {
        let _isQuerySBomId = typeof isQuerySBomId === 'boolean' ? isQuerySBomId : false;
        var data = getMinPriceAndInv(ecProductIds, false, _isQuerySBomId);
        if (data && data.resultCode === 0) {
            /* 成功返回数据 */
            minPriceAndInvList = data.data.minPriceAndInvList;
        }
    }
    return minPriceAndInvList;
}


/**
* 根据当前产品的ecproductId. 查找接口是否有返回数据，并根据其返回结果，处理购买按钮
* @param ecProductID 产品productId
* @param $buyBtn 购买按钮块
*/
function setBuyButtonTextBySbomListForCn(ecProductID, $buyBtn) {
    var siteCode = window.digitalData.page.pageInfo.siteCode || '';
    if (siteCode !== 'cn') {
        return false;
    }

    if (currentPageProductMinPriceSkuMap && currentPageProductMinPriceSkuMap.size > 0) {
        var productDisplayInfo = currentPageProductMinPriceSkuMap.get(ecProductID.trim()) || {};
        // 如果接口返回对应产品数据，则显示购买按钮，如果未返回则隐藏购买按钮
        if (productDisplayInfo && !$.isEmptyObject(productDisplayInfo)) {
            if($buyBtn.hasClass("buy-button-hide-v4")) {
                $buyBtn.removeClass("buy-button-hide-v4");
            }
            $buyBtn.css('display', 'inline-block');
        } else {
            $buyBtn.remove();
        }
    } else {
        //接口未返回数据时, 或请求失败时，隐藏购买按钮
        $buyBtn.remove();
    }
}

/**
* rrp注释弹出层功能单独的代码块
* 用匿名自执行函数包裹此区域代码的优点:
* 能避免变量名称冲突，所以也能避免变量可能被其他人的变量被修改导致可能的报错；
* 能减少全局变量，所以能减少全局变量的污染；
* 能避免函数成全局变量后在调试控制台被随意查看、修改和执行；
*/
(function() {
    'use strict';

    const TOOLTIP_CONFIGS = [
        {
            id: 'rrp',
            globalVar: 'rrpTips',
            baseTriggerClass: 'rrp-tips',
            baseTooltipClass: 'rrp-tooltips',
            modifierTriggerClass: '',
            modifierTooltipClass: ''
        },
        {
            id: 'rfr',
            globalVar: 'rfrTips',
            baseTriggerClass: 'rrp-tips',
            baseTooltipClass: 'rrp-tooltips',
            modifierTriggerClass: 'thirty-tips',
            modifierTooltipClass: 'thirty-tooltips'
        }
    ];

    const TOOLTIP_CLOSE_DELAY = 500;
    const THROTTLE_DELAY = 100;
    const TRIANGLE_OFFSET = 100;

    let documentWidth = $(document).width();
    let documentHeight = $(document).height();

    // 存储每个实例的状态: { [configId]: { $el: jQuery, timer: null, currentTrigger: null } }
    const instanceStates = {};

    /**
     * 检测指定的 Tooltip 配置是否有效（全局变量存在且非空）
     * @param {Object} config 配置项
     * @returns {Boolean} 如果全局变量存在且为有效字符串，返回 true
     */
    function isTooltipConfigValid(config) {
        if (!config || !config.globalVar) {
            return false;
        }
        const content = window[config.globalVar];
        return content !== undefined && content !== null && typeof content === 'string' && content.trim() !== '';
    }

    /**
     * 检查所有配置的 Tooltip 全局变量是否存在
     * @returns {Object} 返回一个对象，键为 config.id，值为 boolean (是否存在)
     */
    function hasTooltipsConfig() {
        return TOOLTIP_CONFIGS.some((config) => isTooltipConfigValid(config));
    }

    if (!hasTooltipsConfig()) {
        return;
    }

    /**
     * 更新文档宽高缓存
     */
    function updateDocumentDimensions() {
        documentWidth = $(document).width();
        documentHeight = $(document).height();
    }

    /**
     * 获取当前窗口的高度
     * @returns {Number}
     */
    function getWinHeight() {
        if (typeof Mkt !== 'undefined' && Mkt.Util && typeof Mkt.Util.windowHeight === 'function') {
            return Mkt.Util.windowHeight();
        }

        return window.innerHeight || document.documentElement.clientHeight;
    }

    /**
     * 节流函数
     * @param {Function} fn
     * @param {Number} delay
     * @returns {Function}
     */
    function throttle(fn, delay) {
        if (typeof fn !== 'function') {
            return function() {
            };
        }

        let previous = 0;
        let timer = null;

        return function() {
            const context = this;
            const args = arguments;
            const now = Date.now();
            const remaining = delay - (now - previous);

            if (remaining <= 0) {
                if (timer) {
                    clearTimeout(timer);
                    timer = null;
                }
                previous = now;
                fn.apply(context, args);
            } else if (!timer) {
                timer = setTimeout(() => {
                    previous = Date.now();
                    timer = null;
                    fn.apply(context, args);
                }, remaining);
            }
        };
    }

    /**
     * 获取基于视口的坐标
     * @param {jQuery}$el
     * @returns {Object}
     */
    function getIconPosBaseViewport($el) {
        if (!$el || $el.length === 0) {
            return { x: 0, y: 0, up: 0, down: 0 };
        }

        const offset = $el[0].getBoundingClientRect();

        return {
            x: offset.x !== undefined ? offset.x : offset.left,
            y: offset.y !== undefined ? offset.y : offset.top,
            up: Math.floor(offset.top),
            down: Math.floor(getWinHeight() - offset.bottom)
        };
    }

    /**
     * 获取基于页面的坐标
     * @param {jQuery} $el
     * @returns {Object}
     */
    function getIconPosBasePage($el) {
        if (!$el || $el.length === 0) {
            return { width: 0, height: 0, left: 0, top: 0, right: 0, bottom: 0 };
        }

        const offset = $el.offset();
        const width = $el.outerWidth();
        const height = $el.outerHeight();

        return {
            width: width,
            height: height,
            left: Math.floor(offset.left),
            top: Math.floor(offset.top),
            right: Math.floor(documentWidth - width - offset.left),
            bottom: Math.floor(documentHeight - height - offset.top)
        };
    }

    /**
     * 渲染单个 Tooltip 实例
     * @param {Object} config 配置项
     */
    function renderSingleTooltip(config) {
        const tooltipSelector = config.modifierTooltipClass
            ? `.${config.baseTooltipClass}.${config.modifierTooltipClass}`
            : `.${config.baseTooltipClass}`;

        if ($(tooltipSelector).length > 0) {
            return;
        }

        const content = window[config.globalVar];
        if (!content || typeof content !== 'string' || content.trim() === '') {
            return;
        }

        const tooltipClasses = [config.baseTooltipClass];
        if (config.modifierTooltipClass) {
            tooltipClasses.push(config.modifierTooltipClass);
        }
        const tooltipClassStr = tooltipClasses.join(' ');

        const html = `
            <article class="${tooltipClassStr}">
                <div class="${config.baseTooltipClass}-wrapper">
                    <div class="${config.baseTooltipClass}-container">
                        <div class="${config.baseTooltipClass}-content">
                            ${content.trim()}
                        </div>
                    </div>
                </div>
                <div class="triangle"></div>
            </article>
        `;

        $(document.body).append(html);

        const $el = $(tooltipSelector);
        instanceStates[config.id] = {
            $el: $el,
            timer: null,
            currentTrigger: null
        };
    }

    /**
     * 初始化所有配置的 Tooltip
     */
    function initTooltips() {
        TOOLTIP_CONFIGS.forEach(config => {
            if (isTooltipConfigValid(config)) {
                renderSingleTooltip(config);
            }
        });
    }

    /**
     * 根据 DOM 元素判断属于哪个配置实例
     * @param {jQuery}$target 目标元素
     * @returns {Object|null} 匹配的配置对象，未匹配返回 null
     */
    function getConfigByElement($target) {
        // 注意：这里假设基础实例是“默认”的。如果元素有 .rrp-tips 但没有 .thirty-tips，则是 rrp
        let rrpConfig = null;
        let notRrpConfig = null;

        for (const config of TOOLTIP_CONFIGS) {
            if ($target.is(`.${config.baseTriggerClass}`)) {
                if (config.modifierTriggerClass) {
                    if ($target.is(`.${config.modifierTriggerClass}`)) {
                        notRrpConfig = config;
                    }
                } else if (config.id === 'rrp') {
                    rrpConfig = config;
                }
            } else {
                return null;
            }
        }

        return notRrpConfig || rrpConfig || null;
    }

    /**
     * 处理单个 Tooltip 的定位和显示
     * @param {Object} config 配置项
     * @param {HTMLElement} triggerElement 触发元素
     */
    function handleTooltipPosition(config, triggerElement) {
        const state = instanceStates[config.id];

        if (!state || !state.$el || !triggerElement) {
            return;
        }

        const $toolTips = state.$el;
        const $this = $(triggerElement);
        const $tipsTextWrapper = $toolTips.find(`.${config.baseTooltipClass}-container`);
        const $triangle = $toolTips.find('.triangle');
        const coordinate = getIconPosBaseViewport($this);
        const iconPos = getIconPosBasePage($this);

        $tipsTextWrapper.css('width', 'max-content');

        const halfToolTipsWidth = $toolTips.outerWidth(true) / 2;
        const toolTipsHeight = $toolTips.outerHeight(true);
        const isFitInTop = iconPos.top > toolTipsHeight && coordinate.up > toolTipsHeight;
        const isFitInBottom = iconPos.bottom > toolTipsHeight && coordinate.down > toolTipsHeight;
        const isFitInLeft = iconPos.left > halfToolTipsWidth;
        const isFitInRight = iconPos.right > halfToolTipsWidth;

        let dir = 'downwards';
        let xAxisOffset = 0;

        // 垂直方向
        if (isFitInTop) {
            $toolTips.removeClass('upwards').addClass('active downwards');
        } else if (isFitInBottom) {
            $toolTips.removeClass('downwards').addClass('active upwards');
            dir = 'upwards';
        } else {
            $toolTips.removeClass('downwards').addClass('active upwards');
            dir = 'upwards';
        }

        // 水平偏移
        if (!isFitInLeft) {
            xAxisOffset = Math.ceil(halfToolTipsWidth - iconPos.left);
        } else if (!isFitInRight) {
            xAxisOffset = Math.ceil(iconPos.right - halfToolTipsWidth);
        }

        // 应用样式
        $toolTips.css({
            'left': coordinate.x + iconPos.width / 2 + xAxisOffset,
            'top': coordinate.y
        });

        // 三角形位置
        const translateY = dir === 'upwards' ? -TRIANGLE_OFFSET : TRIANGLE_OFFSET;
        const transformValue = xAxisOffset
            ? `translate3d(50%, ${translateY}%, 0) translateX(${-xAxisOffset}px)`
            : `translate3d(50%, ${translateY}%, 0)`;

        $triangle.css('transform', transformValue);
    }

    /**
     * 重置关闭定时器
     * @param {Object} config
     */
    function resetCloseTimer(config) {
        const state = instanceStates[config.id];
        if (!state) {
            return;
        }

        if (state.timer) {
            clearTimeout(state.timer);
        }

        state.timer = setTimeout(() => {
            state.$el.removeClass('active');
            state.currentTrigger = null;
            state.timer = null;
        }, TOOLTIP_CLOSE_DELAY);
    }

    /**
     * 关闭指定实例的 Tooltip
     * @param {Object} config
     */
    function closeTooltip(config) {
        const state = instanceStates[config.id];
        if (!state) {
            return;
        }

        if (state.timer) {
            clearTimeout(state.timer);
            state.timer = null;
        }

        state.currentTrigger = null;
        state.$el.removeClass('active');
    }

    /**
     * 关闭所有 Tooltip
     */
    function closeAllTooltips() {
        updateDocumentDimensions();
        TOOLTIP_CONFIGS.forEach(config => closeTooltip(config));
    }

    function bindEvents() {
        const hasTouchEvent = 'ontouchstart' in document.documentElement;

        const allTriggerSelectors = TOOLTIP_CONFIGS.map((c) => `.${c.baseTriggerClass}`).join(',');
        const uniqueTriggerSelectors = allTriggerSelectors.split(',').filter((item, index, arr) => {
            return arr.indexOf(item) === index;
        }).join(',');

        const allTooltipSelectors = TOOLTIP_CONFIGS.map(c => {
            return c.modifierTooltipClass
                ? `.${c.baseTooltipClass}.${c.modifierTooltipClass}`
                : `.${c.baseTooltipClass}`;
        }).join(',');

        const listenerEventTypes = hasTouchEvent ? 'click' : 'mouseenter mouseleave';

        $(document).on(listenerEventTypes, `${uniqueTriggerSelectors},${allTooltipSelectors}`, (ev) => {
            const type = ev.type;
            const $target = $(ev.target);
            const activeConfig = getConfigByElement($target);

            if (!activeConfig) {
                return;
            }

            const state = instanceStates[activeConfig.id];
            if (!state) {
                return;
            }

            if (type === 'mouseleave') {
                resetCloseTimer(activeConfig);
            } else {
                if (state.timer) {
                    clearTimeout(state.timer);
                    state.timer = null;
                }

                const isTriggerOnIcon = $target.is(`.${activeConfig.baseTriggerClass}`);

                if (isTriggerOnIcon) {
                    state.currentTrigger = $target;
                }

                if (state.currentTrigger) {
                    handleTooltipPosition(activeConfig, state.currentTrigger);

                    if (type === 'click') {
                        TOOLTIP_CONFIGS.forEach((config) => {
                            if (activeConfig.id !== config.id) {
                                closeTooltip(config);
                            }
                        });
                    }
                }
            }
        });

        const scrollResizeHandler = throttle(closeAllTooltips, THROTTLE_DELAY);

        $(window).on('scroll.tips resize.tips', scrollResizeHandler);
        $(document).on('click touchstart', (ev) => {
            const $target = $(ev.target);
            let isInsideAnyTooltip = false;
            let isTriggerAnyIcon = false;

            for (const config of TOOLTIP_CONFIGS) {
                const state = instanceStates[config.id];
                if (state && state.$el) {
                    if ($target.closest(`.${config.baseTriggerClass}`).length > 0) {
                        isTriggerAnyIcon = true;
                    }
                    if (state.$el[0] && $.contains(state.$el[0], ev.target)) {
                        isInsideAnyTooltip = true;
                    }
                }
            }

            if (!isTriggerAnyIcon && !isInsideAnyTooltip) {
                closeAllTooltips();
            }
        });
    }

    initTooltips();
    bindEvents();
})();

/**
* 此文件只针对电商站点时，以下组件的价格展示部分公共方法调用
* 1. Products List Component
* 2. Products Hero Component
* 3. Products Comparison Component
* 4. Relate Products Component
* 5. Series Product Compare Component
*/

/**
*价格显示样式（最小销售价，原价=划线价，以及分期内容显示）
*e：整个产品块
*sku_price：接口中返回的价格信息包含 （minUnitPrice，minOrderPrice，hasStaging）
* showFromText: 价格是否显示“from”文本
*/
function price_show(e, sku_price, showFromText) {
    // 不显示电商价格
    if (e && sku_price.sureDepositPrice) {
        e.find(".plp-item-fromprice").html('');

        $('.plp-item-fromprice').matchHeight({
            byRow: true
        });
        return;
    }

    // 价格前的from显示逻辑
    let fromTextFront = "";
    let fromTextBehind = "";
    if (showFromText) {
        let fromText = '<span class="text-from">' + " " + PlpI18n.i18n_from + " " + "</span>";
        if (putFromFront) {
          // plp页面配置from显示在前
          fromTextFront = fromText;
        } else {
          // plp页面配置from显示在后
          fromTextBehind = fromText;
        }
    }

    // RRP 注释信息是否显示
    let tips = "";
    if (rrpTips && enableRRP) {
        tips = '<strong class="rrp-tips"></strong>';
    }

    let priceHtml = "";
    let disableInstallmentCfg = enableInstallmentCfg && (installmentDispType === '' || installmentDispType === 'noDisplay');
    if (sku_price.hasStaging && !disableInstallmentCfg) {
        //显示分期价格时，分期信息分为最大分期数、最小分期金额、固定分期文案
        let installment_info = ''; //分期信息
        let installment_show = ''; //或 + 分期信息
        if(enableInstallmentCfg) {
            // 当开启分期显示配置时，依配置进行分期文本组装
            installment_show = window.ecInstallmentInfo(sku_price.hasStaging);
        }else{
            if(window.siteCode === "uk" || window.siteCode === "de" || window.siteCode === "es") { //固定文案
                installment_info = ecCom.I18n.get("ec_finance_available");
            } else if (window.siteCode === "ru") { //最小分期金额
                installment_info = ecCom.I18n.get("ec_payment_in_installments", [sku_price.hasStaging.amount]);
            } else if(window.siteCode === "ro") {
                installment_info = ecCom.I18n.get("ec_bank_installment");
            } else { //最大分期数
                installment_info = ecCom.I18n.get("ec_payment_in_installments", [sku_price.hasStaging.num]);
            }
            installment_show = ecCom.I18n.get("ec_installment_or") + " " + installment_info;
        }

        if (sku_price.minUnitPrice != sku_price.minOrderPrice) {
          //显示划线价和最低销售价
          priceHtml = showPriceUnitAndOrderAndInstallment(sku_price, fromTextFront, fromTextBehind, tips, installment_show);
        } else {
          //只显示最低销售价
          priceHtml = showUnitPriceAndInstallment(sku_price, fromTextFront, fromTextBehind, installment_show);
        }
  } else {
        //当不支持分期付款信息时，显示原价(划线价)和最低价格
        if (sku_price.minUnitPrice != sku_price.minOrderPrice) {
            //显示划线价和最低销售价
            priceHtml = showPriceUnitAndOrder(sku_price, fromTextFront, fromTextBehind, tips);
        } else {
            //只显示最低销售价
            priceHtml = showUnitPrice(sku_price, fromTextFront, fromTextBehind);
        }
    }
    if (e) {
        e.find(".plp-item-fromprice").html(priceHtml);
    }
    $('.plp-item-fromprice').matchHeight({
        byRow: true
    });
}

function showPriceUnitAndOrderAndInstallment(sku_price, fromTextFront, fromTextBehind, tips, installment_show) {
    // RRP 注释信息显示内容
    let rRPTextLabel = "";
    if(enableRRP){
        rRPTextLabel = '<span>'+RRPText+'</span>';
    }

    // enableScribes 是否展示划线
    let orderPriceStyle = enableScribes ? "text-decoration:line-through;":"";
    let htmlFragment = '<b class="plp-item-price">' +
                                    '<ul class="proPrice">' +
                                        '<li class="salePrice">' + //最低销售价格显示
                                            fromTextFront +
                                            "<span >" +
                                            window.ecCurrency(sku_price.minUnitPrice) +
                                            " </span>" +
                                            fromTextBehind +
                                        "</li>" +
                                        '<li class="minorderprice" style="text-decoration:none;">' +rRPTextLabel+ //原价销售价格显示(划线价)
                                            '<span class="plp-item-minorderprice" style='+ orderPriceStyle + '>' +
                                            window.ecCurrency(sku_price.minOrderPrice) +
                                            tips + //RRP 注释信息
                                            "</span>" +
                                        "</li>" +
                                        '<li class="amountPrice">' + //最低分期价格显示
                                            "<span >" +
                                            installment_show +
                                            "</span>" +
                                        "</li>" +
                                    "</ul>" +
                                "</b>";
    return htmlFragment;
}

function showUnitPriceAndInstallment(sku_price, fromTextFront, fromTextBehind, installment_show) {
    let htmlFragment = '<b class="plp-item-price">' +
                                    '<ul class="proPrice">' +
                                        '<li class="salePrice">' + //最低销售价格显示
                                            fromTextFront +
                                            "<span >" +
                                            window.ecCurrency(sku_price.minUnitPrice) +
                                            " </span>" +
                                            fromTextBehind +
                                        "</li>" +
                                        '<li class="amountPrice">' + //最低分期价格显示
                                            "<span >" +
                                            installment_show +
                                            "</span>" +
                                        "</li>" +
                                    "</ul>" +
                                "</b>";
    return htmlFragment;
}

function showPriceUnitAndOrder(sku_price, fromTextFront, fromTextBehind, tips) {
    // RRP 注释信息显示内容
    let rRPTextLabel = "";
    if(enableRRP){
        rRPTextLabel = '<span style="color: #bebebe;font-size: 13px;font-weight: normal;">'+RRPText+'</span>';
    }

    // enableScribes 是否展示划线
    let orderPriceStyle = enableScribes ? "text-decoration:line-through;":"";
    let htmlFragment = '<b class="plp-item-price">' +
                                    '<ul class="proPrice" role="presentation">' +
                                        '<div class="inShow">' +
                                            '<li class="salePrice" aria-hidden="true">' +
                                                fromTextFront +
                                                "<span >" + window.ecCurrency(sku_price.minUnitPrice) +
                                                "</span>" +
                                                fromTextBehind +
                                             "</li>" +
                                            '<li class="minorderPrice" aria-hidden="true">' +rRPTextLabel+
                                                '<span class="plp-item-minorderprice" style='+ orderPriceStyle + '>' +
                                                    window.ecCurrency(sku_price.minOrderPrice) +
                                                     tips + //RRP 注释信息
                                                "</span>" +
                                            "</li>" +
                                        "</div>" +
                                    "</ul>" +
                                "</b>";
    return htmlFragment;
}

function showUnitPrice(sku_price, fromTextFront, fromTextBehind) {
    let htmlFragment = '<b class="plp-item-price">' +
                                    '<ul class="proPrice" role="presentation">' +
                                        '<div class="inShow">' +
                                            '<li class="minorderPrice" aria-hidden="true">' +
                                                "<span >" +
                                                "</span>" +
                                            "</li>" +
                                            '<li class="salePrice" aria-hidden="true">' +
                                                fromTextFront +
                                                "<span >" +
                                                    window.ecCurrency(sku_price.minUnitPrice) +
                                                "</span>" +
                                                fromTextBehind +
                                            "</li>" +
                                        "</div>" +
                                    "</ul>" +
                                "</b>";
    return htmlFragment;
}

/**
*价格来自admin部分
*priceValue：价格值
*onePriceDisplay：是否显示from
* e：整个价格部分DIV
*/
function handleAdminPriceForEcSite(priceValue, onePriceDisplay, e){
    // 价格前的from显示逻辑
    var fromTextFront = "";
    var fromTextBehind = "";
    if (showFrom && (onePriceDisplay == undefined || !onePriceDisplay)) {
        var fromText = '<span class="text-from">' + " " + ecCom.I18n.get("ec_from") + " " + "</span>";
        if (putFromFront) {
          // plp页面配置from显示在前
          fromTextFront = fromText;
        } else {
          // plp页面配置from显示在后
          fromTextBehind = fromText;
        }
    }
    var priceHtml = '<b class="plp-item-price">' +
                                   '<ul class="proPrice" role="presentation">' +
                                       '<div class="inShow">' +
                                           '<li class="minorderPrice" aria-hidden="true">' +
                                               "<span >" +
                                               "</span>" +
                                           "</li>" +
                                           '<li class="salePrice" aria-hidden="true">' +
                                               fromTextFront +
                                               "<span >" +
                                                 window.ecCurrency(priceValue) +
                                               "</span>" +
                                               fromTextBehind +
                                           "</li>" +
                                       "</div>" +
                                   "</ul>" +
                               "</b>";
    if (e) {
        e.find(".plp-item-fromprice").html(priceHtml);
    }
    $('.plp-item-fromprice').matchHeight({
        byRow: true
    });
}

// 默认的下载地址
var DEFAULT_APP_DOWNLOAD_LINK = 'https://appgallery.huawei.com/app/C10067631?pkgName=com.huawei.phoneservice&channelId=shop&referrer=shop&detailType=0&callType=AGDLINK';
// 调用 My Huawei App 中打开的基础命令 url参数需要传递 encode 之后的完整页面地址
var HOMEPAGE_DEEP_LINK = 'myhuawei://dispatch/home';
var SUPPORT_HOMEPAGE_DEEP_LINK = 'myhuawei://dispatch/phoneservice';
var SUPPORT_DEEP_LINK = 'myhuawei://dispatch/phoneservice/open_phoneservice_webactivity?url=';
var PURCHASE_DEEP_LINK = 'myhuawei://dispatch/shop/huaweistore/goto.app/welcome?';
var SHARE_SOURCE_PARAM = 'sharesource';
var appShare = {
    init: function () {
        // 拉起APP的Deeplink
        var deepLink = appShare.getDeepLinkByUri();
        // 是否于IOS系统中访问
        var isIos = $.isIos();
        // app连接标识(url参数 sharesource 值为 myhuawei 时 允许app中打开
        var shareSourceParam = getUrlParam(SHARE_SOURCE_PARAM);
        // 判断页面是否于移动设备中打开
        var isMobileEnd = Mkt.Util.isMobileEnd();
        /**
         * 触发app中打开动作的前置条件：
         * 1. enableShareFeature：站点首页ADVANCED页签下 Share Setting区域 开关配置Enable share feature
         * 2. !isIos： 非IOS系统中访问
         * 3. shareSourceParam && shareSourceParam == 'myhuawei'：地址栏参数且值为'myhuawei' 表示分享链接允许app中打开动作
         * 4. 判断 deep link 是否有有效值(购买类deep link App site/region 无有效映射时 deep link 值为空字符串, 不拉起App或弹窗动作)
         * 5. isMobileEnd: 当前页面是否于移动端访问
         */
        if (enableShareFeature &&
            !isIos &&
            shareSourceParam &&
            shareSourceParam == 'myhuawei' &&
            deepLink &&
            isMobileEnd) {
            // 调起 My Huawei App 打开链接
            window.location.href = deepLink;
            // 监听当前页调起 My Huawei App 失败 并执行相应处理
            appShare.checkAppOpen();
        }
    },
    /**
     * 检查 app 是否成功打开 未打开时执行弹窗逻辑
     */
    checkAppOpen: function () {
        const visibilityChangeProperty = appShare.getVisibilityChangeProperty();
        const timer = setTimeout(function() {
            const hidden = appShare.isPageHidden();
            if (!hidden) {
                // app下载地址链接(在未配置情况下使用默认下载地址)
                if (!appDownloadLink) {
                    appDownloadLink = DEFAULT_APP_DOWNLOAD_LINK;
                }
                // pop up app download layer
                appShare.handleSharePop();
            }
        }, 2000);
        if (visibilityChangeProperty) {
            document.addEventListener(visibilityChangeProperty, function() {
                clearTimeout(timer);
            });
            return;
        }
        window.addEventListener('pagehide', function() {
            clearTimeout(timer);
        });
    },

    /**
     * 通过地址规则判断取得对应的 Deep Link
     */
    getDeepLinkByUri:function () {
        var deepLink = '';
        var uri = window.digitalData.page.pageInfo.uri;
        var pageType = window.digitalData.page.category.pageType;
        var primaryCategory = window.digitalData.page.category.primaryCategory;
        var pageSubCategory1 = window.digitalData.page.category.subCategory1;
        var currentUrl = appShare.removeUrlParams(window.location.href, SHARE_SOURCE_PARAM);
        // 社区类页面 或 account类页面 或 PCP类页面返回空deepLink(官网侧不做分享拉取App动作)
        if (primaryCategory == 'community' || primaryCategory == 'account' || pageType == 'product-detail_buy') {
            return deepLink;
        }
        // support类页面
        if (pageType == 'support') {
            // 非support首页 (存在subcategory)
            if (pageSubCategory1) {
                deepLink = SUPPORT_DEEP_LINK + encodeURI(currentUrl);
                return deepLink;
            } else { // support 首页
                return SUPPORT_HOMEPAGE_DEEP_LINK;
            }
        }
        // 站点首页 及 非站点首页(else)
        if (pageType == 'homepage') {
            deepLink = HOMEPAGE_DEEP_LINK;
        } else {
            // 依照 Deep Link 传参规则进行参数组装
            var appRegion = appShare.getAppRegionByMapper();
            if (appRegion) {
                deepLink = PURCHASE_DEEP_LINK + 'link=WebView&site=' + appRegion + '&prdUrl=' + encodeURI(currentUrl);
            }
        }
        return deepLink;
    },

    /**
     * 通过App region mapper JSON 通过 site code 取得 App region 映射
     */
    getAppRegionByMapper:function () {
        var appRegion = '';
        var siteCode = window.digitalData.page.pageInfo.siteCode2;
        if (appRegionMapperJsonStr) {
            regionSiteMapper = JSON.parse(appRegionMapperJsonStr);
            for (var i = 0; i < regionSiteMapper.length; i++) {
                var mapperSite = regionSiteMapper[i].site.trim();
                if (siteCode == mapperSite) {
                    appRegion = regionSiteMapper[i].region.trim();
                }
            }
        }
        return appRegion;
    },

    /**
     * 移除 url 中的指定参数(param)
     */
    removeUrlParams:function (pageUrl, param) {
       var url = pageUrl.split('?')[0] + '?';
       var sPageURL = decodeURIComponent(window.location.search.substring(1)),
          urlParams = sPageURL.split('&'),
          paramName,
          i;
       for (i = 0; i < urlParams.length; i++) {
          paramName = urlParams[i].split('=');
          if (paramName[0] && paramName[1] && paramName[0] != param) {
              url = url + paramName[0] + '=' + paramName[1] + '&';
          }
       }
       return url.substring(0, url.length - 1);
    },

    /**
     * 拉起下载 弹窗
     * 下载链接：appDownloadLink
     * 点击空白区域，继续浏览按钮，关闭弹窗
     */
    handleSharePop:function () {
        let continueBrowsingText = Mkt.I18n.get("Continue browsing");    // i18n cn：继续浏览
        let myHuaweiText = Mkt.I18n.get("My Huawei");                    // i18n cn：我的华为
        let sharingSmartLifeText = Mkt.I18n.get("Sharing smart life");   // i18n cn：共享智慧生活
        let openText = Mkt.I18n.get("Open");                             // i18n cn：打开
        let currentPageText = Mkt.I18n.get("Current Page");              // i18n cn：当前页面
        let continueText = Mkt.I18n.get("Continue");                     // i18n cn：继续
        let $sharePopDom = (
            "<div class='huawei-app-share'>" +
            "<div class='huawei-app-share-pop'>" +
            "   <div class='huawei-app-pop-box'>" +
            "       <div class='huawei-app-pop-title'>" + continueBrowsingText + "</div>" +
            "       <div class='huawei-app-pop-myhuawei'>" +
            "           <div class='huawei-app-pop-content'>" +
            "               <img src='/etc/designs/huawei-cbg-site/images/common/app-image-my-huawei.png'" +
            "                    alt=' " + myHuaweiText + " ' title=' " + myHuaweiText + " '>" +
            "               <span class='huawei-app-pop-text'>" +
            "                   <span>" + myHuaweiText + "</span>" +
            "                   <span class='small'>" + sharingSmartLifeText + "</span>" +
            "               </span>" +
            "           </div>" +
            "           <div class='huawei-app-button-box'>" +
            "               <a href = ' " + appDownloadLink + " ' class='huawei-app-pop-button'>" + openText + "</a>" +
            "           </div>" +
            "       </div>" +
            "       <div class='huawei-app-pop-hwBrowsers'>" +
            "           <div class='huawei-app-pop-content'>" +
            "               <img src='/etc/designs/huawei-cbg-site/images/common/app-image-current-browsers.png'" +
            "                    alt=' " + currentPageText + " ' title=' " + currentPageText + " '>" +
            "               <span class='huawei-app-pop-text'>" + currentPageText + "</span>" +
            "           </div>" +
            "           <div class='huawei-app-button-box'>" +
            "               <a href='javascript:;' class='huawei-app-pop-button btn-continue'>" + continueText + "</a>" +
            "           </div>" +
            "       </div>" +
            "    </div>" +
            "    </div>" +
            "</div>");
        $('body').append($sharePopDom);

        if ($(".huawei-app-share-pop").length > 0) {
            let $sharePopBox = $(".huawei-app-share-pop");
            $sharePopBox.css('bottom', '-' + $(".huawei-app-share-pop").height() + 'px');
            $sharePopBox.animate({bottom: '0'}, 300);

            // 点击空白区域
            $(document).on("click", function (event) {
                let $targetParents = $(event.target).parents();
                if ($targetParents.hasClass("huawei-app-share-pop")) {
                    return;
                } else {
                    $sharePopBox.animate({
                        bottom: '-' + $(".huawei-app-share-pop").height() + 'px',
                    }, 300, function () {
                        $(".huawei-app-share").remove();
                    });
                }
            });

            // 点击继续按钮(未来添加的元素点击事件)
            $(document).on("click", ".btn-continue", function () {
                $sharePopBox.animate({
                    bottom: '-' + $(".huawei-app-share-pop").height() + 'px',
                }, 300, function () {
                    $(".huawei-app-share").remove();
                });
            });

        }
    },
    /**
     * 判断页面是否隐藏（进入后台）
     */
    isPageHidden: function () {
        const prefix = appShare.getPagePropertyPrefix();
        if (prefix === false) return false;
        const hiddenProperty = prefix ? prefix + 'Hidden' : 'hidden';
        return document[hiddenProperty];
    },
    /**
     * 获取判断页面 显示|隐藏 状态改变的属性
     */
    getVisibilityChangeProperty: function () {
        const prefix = appShare.getPagePropertyPrefix();
        if (prefix === false) return false;
        return prefix + 'visibilitychange';
    },
    /**
     * 获取页面属性前缀
     */
    getPagePropertyPrefix: function () {
        const prefixes = ['webkit', 'moz', 'ms', 'o'];
        let correctPrefix = void 0;
        if ('hidden' in document) return '';
        prefixes.forEach(function(prefix) {
            if (prefix + 'Hidden' in document) {
                correctPrefix = prefix;
            }
        });
        return correctPrefix || false;
    }
};
$(function () {
    // invoke init method
    appShare.init();
});
;
const $currentPageCategory = window.digitalData ? window.digitalData.page.category.pageType : "";
const $currentPagePrimaryCategory =  window.digitalData ? window.digitalData.page.category.primaryCategory: "";
const haAvailableMktPageType = ['homepage','product-listing','product-detail','product-detail_specs','search','shop'];

/*
 * mkt侧，Ha 埋码, 复用电商ha 上报方法
 *
 */
function buryPointHA(code, el, object) {
    if (window._hasdk && window.isECommerceSite !== "None" && window.ecCom
        && (haAvailableMktPageType.includes($currentPageCategory) || $currentPagePrimaryCategory === "offer")) {
        let buryData = {
            en: code,
            el: el,
            cd: object
        };
        window.ecCom.HATrack.sendData(buryData);
    }
}
;(function() {
    'use strict';

    // 能效标签图片点击
    $('body').on('click', '.mkt-common-pel-img', function() {
        let that = $(this);
        let isMob = window.innerWidth < 1080;
        let pelPdfFilePath = that.find('img').attr('data-pdfFilePath');
        let pelPopUpTitle;
        let pelPopUpButtonText;
        if (ecCom && ecCom.I18n && typeof ecCom.I18n.get === 'function') {
            pelPopUpTitle = ecCom.I18n.get('ec_product_energy_information');
            pelPopUpButtonText = ecCom.I18n.get('ec_view_full_information');
        }

        if (isMob) {
            handlePdfDownload(pelPdfFilePath);
        } else {
            handleCreatePelPopup(pelPdfFilePath, pelPopUpTitle, pelPopUpButtonText);
        }

    });

    function handlePdfDownload(url) {
        if (!url) {
            return;
        }

        fetch(url)
            .then((response) => {
                return response.blob();
            })
            .then((blob) => {
                let blobUrl = URL.createObjectURL(blob);
                let link = document.createElement('a');

                link.href = blobUrl;

                document.body.appendChild(link);
                link.click();

                document.body.removeChild(link);

                // 释放 blob URL 内存
                setTimeout(() => {
                    URL.revokeObjectURL(blobUrl);
                }, 500);
            })
            .catch((error) => {
                console.error('下载失败:', error.message || error);
            });

    }

    function handleCreatePelPopup(pelPdfFilePath, pelPopUpTitle, pelPopUpButtonText) {

        let overlay = document.createElement('div');
        let container = document.createElement('div');
        let closeBtn = document.createElement('span');
        let title = document.createElement('h1');
        let iframe = document.createElement('iframe');
        let button = document.createElement('a');
        let em = document.createElement('em');

        overlay.className = 'mkt-pel-popup-overlay';
        container.className = 'mkt-pel-popup-container';
        closeBtn.className = 'mkt-pel-popup-close';
        title.className = 'mkt-pel-popup-title';
        iframe.className = 'mkt-pel-popup-iframe';
        button.className = 'mkt-pel-popup-button';

        title.innerHTML = pelPopUpTitle;

        button.href = pelPdfFilePath;
        button.target = '_blank';
        button.innerHTML = pelPopUpButtonText;

        em.innerHTML = ' &gt;';
        button.appendChild(em);

        // 设置 iframe 的 src + 隐藏工具栏/导航窗格/滚动条/设置适应视口宽度
        iframe.src = pelPdfFilePath + '#toolbar=0&navpanes=0&scrollbar=0&zoom=FitV';

        container.appendChild(title);
        container.appendChild(closeBtn);
        container.appendChild(iframe);
        container.appendChild(button);
        overlay.appendChild(container);

        document.body.appendChild(overlay);

        overlay.style.display = 'flex';
        handlePelDisableScroll();

        function closePopup() {
            iframe.src = ''; // 清空 src
            overlay.remove();
            handlePelEnableScroll();
        }

        closeBtn.onclick = (e) => {
            e.stopPropagation();
            closePopup();
        };

        overlay.onclick = (e) => {
            if (e.target === overlay) {
                closePopup();
            }
        };

        // Esc 关闭
        document.onkeydown = (e) => {
            if (e.keyCode === 27) {
                closePopup();
            }
        };

    }

    function handlePelDisableScroll() {
        let scrollTop = window.pageYOffset;
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.top = '-' + scrollTop + 'px';
        document.body.style.width = '100%';
        // 保存滚动位置
        document.body.setAttribute('data-pel-scroll-top', scrollTop);
    }

    function handlePelEnableScroll() {
        let scrollTop = document.body.getAttribute('data-pel-scroll-top') || 0;
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollTop));
    }

    function handleMobResolutionPopup() {
        let width = window.innerWidth;
        let pelPopup = $('.mkt-pel-popup-overlay').length;
        if (width < 1080 && pelPopup) {
            $('.mkt-pel-popup-overlay').remove();
            handlePelEnableScroll();
        }
    }

    // 监听窗口 resize 事件
    window.addEventListener('resize', handleMobResolutionPopup);
})();
;(function() {
    'use strict';

    const isEcSite = window.isECommerceSite && window.isECommerceSite !== 'None';

    const shopCartPopupEc = document.querySelector('.header.v5-style .shop-cart-popup-ec, .header.site-header .shop-cart-popup-ec');

    const noHeadNav = document.querySelector('body.nav-hidden');

    const navShopCartSwitch = !!shopCartPopupEc;

    const noHeadNavPage = !!noHeadNav;

    const popupGroup = document.querySelector('.shop-cart-popup-ec .shop-popup-product-group');

    const navBagIconDom = $('.v5-style .shop-bag-bnt, .header.site-header .shop-bag-bnt.nav-action-bag');

    //navShopCartSwitch 一级导航购物车弹窗开关
    if (!isEcSite || !navShopCartSwitch || noHeadNavPage || !popupGroup) return;

    window.updateNavShopCartPopup = fetchNavShopCartData;

    fetchNavShopCartData();

    function fetchNavShopCartData() {

        navBagIconDom.css('pointer-events', '');
        let ecCartId = Mkt.Util.getCookie('cartId') || '';
        let apiQueryCart = 'convert/queryCart';
        const cardInfo = {
            'cartId': ecCartId,
            'autoCoupon': true
        };

        let getShopCartProductData = () => {

            let def = $.Deferred();
            let params = {};
            params.api = apiQueryCart;
            params.type = 'GET';
            params.async = 'true';
            params.data = cardInfo;

            params.success = (data) => {
                def.resolve(data);
            };

            params.error = (xhr, status, error) => {
                def.reject(xhr, status, error);
            };

            typeof ecCom.ajaxReq === 'function' && ecCom.ajaxReq(params);

            return def.promise();
        };

        let getShopCartImageHref = () => {
            let siteCode = window.digitalData ? window.digitalData.page.pageInfo.siteCode : '';
            const url = `/.rest/service/ecommerce/v1/products/${siteCode}`;

            return fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            });
        };

        // 接口数据
        Promise.all([getShopCartProductData(), getShopCartImageHref()])
            .then(res => {
                const cartData = res[0];
                const imageHref = res[1];

                if (cartData.resultCode === 0) {
                    processData(cartData.data, imageHref);
                    navBagIconDom.css('pointer-events', 'auto');
                } else {
                    $('.shop-cart-popup-ec .shop-popup-buy-now').hide();
                    $('.shop-cart-popup-ec .shop-popup-review-bag').hide();
                }
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    }

    function processData(data, hrefMap) {

        let cartInfo = (data && data.cartInfo && data.cartInfo.itemInfos) || null;

        if (cartInfo && Array.isArray(cartInfo)) {
            cartInfo = cartInfo.slice(0, 4);
        }

        let imageHost = (data && data.imageHost) || null;

        let totalNumber = (data && data.cartInfo && data.cartInfo.originalTotalNumber) || null;

        let isEcLoginStatus = false;

        if ($('.v5-style .login-v4-wrap, .header.site-header .login-v4-wrap').hasClass('signin') || Mkt.Util.getCookie('ec-loginStatus') === '1') {
            isEcLoginStatus = true;
        }

        $('body').on('click', '.shop-popup-login', function() {
            toggleLoginStatus(this);
        });

        if (cartInfo) {
            handleShopCartProducts(cartInfo, hrefMap, imageHost);
            handleShopIsNotEmptyContent(totalNumber, isEcLoginStatus);  // 非空车
            handleShopCartPopupImageLazy();
        } else {
            handleShopIsEmptyContent(isEcLoginStatus); // 空车
        }
        handleUpdatePopupHeight();
    }

    function handleShopCartProducts(itemInfos, hrefMap, imageHost) {

        if (!itemInfos.length) return;

        popupGroup.innerHTML = '';

        const fragment = document.createDocumentFragment();
        itemInfos.forEach(itemInfo => {

            let productHTML = createShopCartPopupProduct(itemInfo, hrefMap, imageHost);
            const div = document.createElement('div');
            div.innerHTML = productHTML;
            fragment.appendChild(div.firstChild);

        });

        popupGroup.appendChild(fragment);
    }

    function createShopCartPopupProduct(itemInfo, hrefMap, imageHost) {

        const imagePathSize = '142_142_';

        const itemSbom = itemInfo.sbom;

        const productId = itemSbom.productId;

        const itemHref = hrefMap[productId] && hrefMap[productId].popLink && hrefMap[productId].popLink.replace('/content/huawei-cbg-site', '');

        const hrefAttr = itemHref ? itemHref : 'javascript:false';

        const targetAttr = itemHref ? '_blank' : '';

        const fullImagePath = `${imageHost}${itemSbom.photoPath}${imagePathSize}${itemSbom.photoName}`;

        const isReducePrice = itemInfo.originalPrice !== itemInfo.salePrice;

        const originalPriceDisplay = `${isReducePrice ? itemInfo.originalPrice : ''}`;

        const displayPriceReduction = itemInfo.displayPriceReduction;

        const promotionTitle = popupGroup.getAttribute('data-promotion-title');

        const priceReductionAmount = displayPriceReduction ? (itemInfo.priceReductionAmount || '') : '';

        const newPromotionTitle = promotionTitle && priceReductionAmount ? promotionTitle.replace(/\{0\}/i, priceReductionAmount) : priceReductionAmount;

        return `<div class="shop-popup-product-item">
                    <div class="product-item-img">
                        <a href="${hrefAttr}" target="${targetAttr}">
                            <img class="shop-img-lazy" data-src="${fullImagePath}" alt="${itemInfo.itemName}">
                        </a>
                    </div>
                    <div class="product-item-info">
                        <a href="${hrefAttr}" target="${targetAttr}">
                            <div class="product-item-name">${itemInfo.itemName}</div>
                        </a>
                        <div class="product-item-price">
                            <div class="product-item-originalPrice">
                                <span class="originalPrice">${handleShopCartPopupCurrency(originalPriceDisplay)}</span>
                                <span class="product-item-reductionAmount">${isReducePrice ? newPromotionTitle : ''}</span> 
                            </div>
                            <div class="product-item-promotionPrice">
                                ${handleShopCartPopupCurrency(itemInfo.salePrice)}
                                <span class="product-item-reductionAmount">${isReducePrice ? '' : newPromotionTitle}</span>
                            </div>
                            <div class="product-item-reductionAmount-mob">${newPromotionTitle}</div>
                        </div>
                    </div>
                </div>`;
    }

    function handleShopCartPopupCurrency(price) {    // 货币符号

        if (!String(price).length) return price;

        if (window.ecCurrency && typeof window.ecCurrency === 'function') {
            return window.ecCurrency(price);
        } else {
            return price;
        }

    }

    function handleShopCartPopupImageLazy() {

        let shopBagButton = document.querySelector('.header.site-header .shop-bag-bnt.nav-action-bag, .v5-style .shop-bag-bnt');
        let shopCartPopupImg = document.querySelectorAll('.shop-cart-popup-ec .shop-img-lazy');

        let isAnyImageLoaded = Array.from(shopCartPopupImg).every(img => img.hasAttribute('src'));

        if (isAnyImageLoaded) return;

        const callback = function() {
            const lazyImages = document.querySelectorAll('.shop-cart-popup-ec .shop-img-lazy');
            lazyImages.length && lazyImages.forEach(img => {
                if (img.hasAttribute('data-src') && !img.hasAttribute('src')) {
                    let dataSrc = img.getAttribute('data-src');
                    img.setAttribute('src', dataSrc);
                }
            });
        };

        const observer = new MutationObserver(callback);

        shopBagButton.addEventListener('click', () => {
            callback();
            observer.observe(shopBagButton, {
                childList: true,
                subtree: true,
                attributeFilter: ['class', 'style']
            });
        });
    }

    function handleShopCartPopupNum(totalNumber) {

        const shopPopupMyBag = document.querySelector('.shop-popup-my-bag');
        const shopCartNumTemplate = shopPopupMyBag.getAttribute('data-shop-cart-num');
        const emptyTitle = shopPopupMyBag.getAttribute('data-empty-title');

        if (totalNumber) {

            let totalQty = totalNumber;

            shopPopupMyBag.innerHTML = '';

            const newBagContent = shopCartNumTemplate.replace(/\{0\}/i, totalQty) || '';

            shopPopupMyBag.textContent = newBagContent;

        } else {

            shopPopupMyBag.textContent = emptyTitle || '';
        }
    }

    function handleShopIsNotEmptyContent(totalNumber, isEcLoginStatus) {
        if (isEcLoginStatus) {
            handleShopCartPopupNum(totalNumber);
            $('.shop-cart-popup-ec .shop-popup-my-bag').show();
            $('.shop-cart-popup-ec .shop-popup-buy-now').show();
            $('.shop-cart-popup-ec .shop-popup-review-bag').hide();
            $('.shop-cart-popup-ec .shop-popup-not-login').hide();
            $('.shop-cart-popup-ec .shop-popup-sub-title').hide();
        } else {
            $('.shop-cart-popup-ec .shop-popup-my-bag').hide();
            $('.shop-cart-popup-ec .shop-popup-buy-now').hide();
            $('.shop-cart-popup-ec .shop-popup-review-bag').show();
            $('.shop-cart-popup-ec .shop-popup-not-login').show();
            $('.shop-cart-popup-ec .shop-popup-sub-title').show();
        }
    }

    function handleShopIsEmptyContent(isEcLoginStatus) {
        popupGroup.innerHTML = "";
        handleShopCartPopupNum(false);
        $('.shop-cart-popup-ec .shop-popup-buy-now').hide();
        $('.shop-cart-popup-ec .shop-popup-review-bag').hide();
        if (isEcLoginStatus) {
            $('.shop-cart-popup-ec .shop-popup-my-bag').show();
            $('.shop-cart-popup-ec .shop-popup-not-login').hide();
            $('.shop-cart-popup-ec .shop-popup-sub-title').hide();
            $('.shop-cart-popup-ec .shop-popup-shopping-now').css('display', 'block');
        } else {
            $('.shop-cart-popup-ec .shop-popup-my-bag').hide();
            $('.shop-cart-popup-ec .shop-popup-not-login').show();
            $('.shop-cart-popup-ec .shop-popup-sub-title').show();
        }
    }

    function handleUpdatePopupHeight() {
        const siteHeader = document.querySelector('.site-header');
        const searchFlyout = document.querySelector('.site-header .bag-flyout.shop-cart-popup-ec');
        let navCartIsOpen = $('.nav-action.nav-item.shop-bag-bnt').hasClass('flyout-open');

        if ( window.innerWidth < 1080 || !siteHeader || !navCartIsOpen ) {
            return;
        }

        let newHeight = $('.bag-flyout-container.shop-cart-wrapper').outerHeight(true);

        if (siteHeader) {
            siteHeader.style.setProperty('--header_flyout_end_h', `${newHeight}px`);
            siteHeader.style.setProperty('--header_background_height', `${newHeight + 20}px`);
        }

        if (searchFlyout) {
            searchFlyout.style.setProperty('--flyout_height', `${newHeight}px`);
            searchFlyout.style.setProperty('--header_background_height', `${newHeight + 20}px`);
        }
    }

})();
