/*
 * ***************************************************************************
 * Copyright (c) 2010 Qcadoo Limited
 * Project: Qcadoo Framework
 * Version: 1.2.0
 *
 * This file is part of Qcadoo.
 *
 * Qcadoo is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation; either version 3 of the License,
 * or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 * See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * ***************************************************************************
 */
var QCD = QCD || {};
QCD.components = QCD.components || {};

QCD.components.Component = function (element, mainController) {
    "use strict";
    
    if (!(this instanceof QCD.components.Component)) {
        return new QCD.components.Component(element, mainController);
    }
	
	var elementPath = element.attr('id'),
        elementSearchName = elementPath.replace(/\./g, "\\."),
        elementName = elementPath.split(".")[elementPath.split(".").length - 1],
        isVisible = true,
        isEnabled = true,
        isPermanentlyDisabled = false,
        onChangeListeners = [];
	
	this.element = element;
	this.elementPath = elementPath;
	this.elementSearchName = elementSearchName;
	this.elementName = elementName;
	
	this.contextObject = null;
	
	this.getValue = function () {
		var valueObject = {};
		
		valueObject.enabled = isEnabled;
		valueObject.visible = isVisible;
		valueObject.permanentlyDisabled = isPermanentlyDisabled;
		
		if (this.getComponentValue) {
			valueObject.content = this.getComponentValue();
		} else {
			valueObject.content = null;
		}
		if (this.contextObject) {
			valueObject.context = this.contextObject;
		}
		if (this.getComponentsValue) {
			valueObject.components = this.getComponentsValue();
		}
		return valueObject;
	};
	
	this.setValue = function (value) {
	    if (value.performBackRequired) {
            mainController.goBack(true);
            return;
        }
		this.setPermanentlyDisabled(value.permanentlyDisabled);
		this.setEnabled(value.enabled);
		this.setVisible(value.visible);
		this.setMessages(value.messages);
		
		if (value.components) {
			this.setComponentsValue(value);
		}
		if (typeof value.content !== 'undefined' && value.content !== null) {
			this.setComponentValue(value.content);
		}
		if (value.updateState) {
			this.performUpdateState();
		}
        this.fireOnChangeListeners("onSetValue", [value]);
	};
	
	this.performUpdateState = function () {
	};
	
	this.performInitialize = function () {
	};
	
	this.addContext = function (contextField, contextValue) {
		if (! this.contextObject) {
			this.contextObject = {};
		}
		this.contextObject[contextField] = contextValue;
	};
	
	this.fireEvent = function (actionsPerformer, eventName, args) {
		if (this.beforeEventFunction) {
			this.beforeEventFunction();
		}
		mainController.callEvent(eventName, elementPath, null, args, actionsPerformer);
	};
	
	this.setState = function (state) {
		this.setPermanentlyDisabled(state.permanentlyDisabled);
		this.setEnabled(state.enabled);
		this.setVisible(state.visible);
		if (this.setComponentState) {
			this.setComponentState(state.content);
		} else {
			QCD.error(this.elementPath + ".setComponentState() no implemented");
		}
		if (state.components) {
			this.setComponentsState(state);
		}
        this.fireOnChangeListeners("onSetValue", [state]);
	};
	
	this.setEditable = function (isEditable) {
		this.setComponentEditable(isEditable);
	};
	
	this.performScript = function () {
		if (this.options.script) {
			mainController.getActionEvaluator().performJsAction(this.options.script, this);
		}
		if (this.performComponentScript) {
			this.performComponentScript();
		}
	};
	
	this.updateSize = function (width, height) {
	};

	this.setMessages = function (messages) {
		for (var i in messages) {
			mainController.showMessage(messages[i]);
		}
	};
	
	this.setPermanentlyDisabled = function (shouldBeDisabled, isDeep) {
		isPermanentlyDisabled = shouldBeDisabled;
		this.setComponentEnabled(!shouldBeDisabled);
		if (isDeep && this.components) {
			for (var i in this.components) {
				this.components[i].setPermanentlyDisabled(shouldBeDisabled, true);
			}
		}
	};
	
	this.isPermanentlyDisabled = function () {
		return isPermanentlyDisabled;
	};

	this.setEnabled = function (shouldBeEnabled, isDeep) {
		if (isPermanentlyDisabled) {
			isEnabled = false;
		} else {
			isEnabled = shouldBeEnabled;
		}
		this.setComponentEnabled(isEnabled);
		if (isDeep && this.components) {
			for (var i in this.components) {
				this.components[i].setEnabled(shouldBeEnabled, true);
			}
		}
	};
	
	this.isEnabled = function () {
		return isEnabled;
	};
	
	this.setVisible = function (isVisible) {
		if (this.setComponentVisible) {
			this.setComponentVisible(isVisible);
		} else {
			if (isVisible) {
				element.show();
			} else {				
				element.hide();
			}
		}
	};
	
	this.isVisible = function () {
		return isVisible;
	};

	this.addOnChangeListener = function (listener) {
		onChangeListeners.push(listener);
	};
	
	this.removeOnChangeListeners = function (listener) {
		onChangeListeners = [];
	};
	
	this.fireOnChangeListeners = function (method, args) {
	    var onChangeListenersLen = onChangeListeners.length,
            i = 0,
            listener = null;
		for (i = 0; i < onChangeListenersLen; i++) {
			listener = onChangeListeners[i][method];
			if (typeof listener === 'function') {
				listener.apply(this, args);
			}
		}
	};
	
	this.isChanged = function () {
		return this.isComponentChanged();
	};
	
	this.isComponentChanged = function () {
		return false;
	};
	
	function constructor(that) {
        var optionsElement = element.children(".element_options");
        if (!optionsElement.html() || $.trim(optionsElement.html()) === "") {
            that.options = {};
        } else {
            that.options = jsonParse(optionsElement.html());
        }
        optionsElement.remove();
        isVisible = that.options.defaultVisible;
        isEnabled = that.options.defaultEnabled;
    }
	
	constructor(this);

};
