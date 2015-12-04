
/*
`<iron-form>` is an HTML `<form>` element that can validate and submit any custom
elements that implement `Polymer.IronFormElementBehavior`, as well as any
native HTML elements.

It supports both `get` and `post` methods, and uses an `iron-ajax` element to
submit the form data to the action URL.

  Example:

    <form is="iron-form" id="form" method="post" action="/form/handler">
      <paper-input name="name" label="name"></paper-input>
      <input name="address">
      ...
    </form>

By default, a native `<button>` element will submit this form. However, if you
want to submit it from a custom element's click handler, you need to explicitly
call the form's `submit` method.

  Example:

    <paper-button raised onclick="submitForm()">Submit</paper-button>

    function submitForm() {
      document.getElementById('form').submit();
    }

To customize the request sent to the server, you can listen to the `iron-form-presubmit`
event, and modify the form's[`iron-ajax`](https://elements.polymer-project.org/elements/iron-ajax)
object. However, If you want to not use `iron-ajax` at all, you can cancel the
event and do your own custom submission:

  Example of modifying the request, but still using the build-in form submission:

    form.addEventListener('iron-form-presubmit', function() {
      this.request.method = 'put';
      this.request.params = someCustomParams;
    });

  Example of bypassing the build-in form submission:

    form.addEventListener('iron-form-presubmit', function(event) {
      event.preventDefault();
      var firebase = new Firebase(form.getAttribute('action'));
      firebase.set(form.serialize());
    });

@demo demo/index.html
*/

  Polymer({

    is: 'iron-form',

    extends: 'form',

    properties: {
      /**
       * Content type to use when sending data.
       */
      contentType: {
        type: String,
        value: "application/x-www-form-urlencoded"
      },

      /**
       * By default, the form will display the browser's native validation
       * UI (i.e. popup bubbles and invalid styles on invalid fields). You can
       * manually disable this; however, if you do, note that you will have to
       * manually style invalid *native* HTML fields yourself, as you are
       * explicitly preventing the native form from doing so.
       */
      disableNativeValidationUi: {
        type: Boolean,
        value: false
      },

      /**
      * Set the withCredentials flag when sending data.
      */
      withCredentials: {
        type: Boolean,
        value: false
      },

      /**
      * HTTP request headers to send
      *
      * Note: setting a `Content-Type` header here will override the value
      * specified by the `contentType` property of this element.
      */
      headers: {
        type: Object,
        value: function() {
          return {};
        }
      },

      /**
      * iron-ajax request object used to submit the form.
      */
      request: {
        type: Object,
      }
    },

    /**
     * Fired if the form cannot be submitted because it's invalid.
     *
     * @event iron-form-invalid
     */

    /**
     * Fired before the form is submitted.
     *
     * @event iron-form-presubmit
     */

    /**
     * Fired after the form is submitted.
     *
     * @event iron-form-submit
     */

     /**
      * Fired after the form is reset.
      *
      * @event iron-form-reset
      */

    /**
    * Fired after the form is submitted and a response is received. An
    * IronRequestElement is included as the event.detail object.
    *
    * @event iron-form-response
    */

    /**
     * Fired after the form is submitted and an error is received. An
     * IronRequestElement is included as the event.detail object.
     *
     * @event iron-form-error
     */
    listeners: {
      'iron-form-element-register': '_registerElement',
      'iron-form-element-unregister': '_unregisterElement',
      'submit': '_onSubmit',
      'reset': '_onReset'
    },

    ready: function() {
      // Object that handles the ajax form submission request.
      this.request = document.createElement('iron-ajax');
      this.request.addEventListener('response', this._handleFormResponse.bind(this));
      this.request.addEventListener('error', this._handleFormError.bind(this));

      // Holds all the custom elements registered with this form.
      this._customElements = [];
      // Holds the initial values of the custom elements registered with this form.
      this._customElementsInitialValues = [];
    },

    /**
     * Submits the form.
     */
    submit: function() {
      if (!this.noValidate && !this.validate()) {
        // In order to trigger the native browser invalid-form UI, we need
        // to do perform a fake form submit.
        if (!this.disableNativeValidationUi) {
          this._doFakeSubmitForValidation();
        }
        this.fire('iron-form-invalid');
        return;
      }

      var json = this.serialize();

      // Native forms can also index elements magically by their name (can't make
      // this up if I tried) so we need to get the correct attributes, not the
      // elements with those names.
      this.request.url = this.getAttribute('action');
      this.request.method = this.getAttribute('method');
      this.request.contentType = this.contentType;
      this.request.withCredentials = this.withCredentials;
      this.request.headers = this.headers;

      if (this.method.toUpperCase() === 'POST') {
        this.request.body = json;
      } else {
        this.request.params = json;
      }

      // Allow for a presubmit hook
      var event = this.fire('iron-form-presubmit', {}, {cancelable: true});
      if(!event.defaultPrevented) {
        this.request.generateRequest();
        this.fire('iron-form-submit', json);
      }
    },

    /**
     * Handler that is called when the native form fires a `submit` event
     *
     * @param {Event} event A `submit` event.
     */
    _onSubmit: function(event) {
      this.submit();

      // Don't perform a page refresh.
      if (event) {
        event.preventDefault();
      }

      return false;
    },

    /**
     * Handler that is called when the native form fires a `reset` event
     *
     * @param {Event} event A `reset` event.
     */
    _onReset: function(event) {
      this._resetCustomElements();
    },

    /**
     * Returns a json object containing name/value pairs for all the registered
     * custom components and native elements of the form. If there are elements
     * with duplicate names, then their values will get aggregated into an
     * array of values.
     *
     * @return {!Object}
     */
    serialize: function() {
      var json = {};

      function addSerializedElement(el) {
        // If the name doesn't exist, add it. Otherwise, serialize it to
        // an array,
        if (!json[el.name]) {
          json[el.name] = el.value;
        } else {
          if (!Array.isArray(json[el.name])) {
            json[el.name] = [json[el.name]];
          }
          json[el.name].push(el.value);
        }
      }

      // Go through all of the registered custom components.
      for (var el, i = 0; el = this._customElements[i], i < this._customElements.length; i++) {
        if (this._useValue(el)) {
          addSerializedElement(el);
        }
      }

      // Also go through the form's native elements.
      for (var el, i = 0; el = this.elements[i], i < this.elements.length; i++) {
        // Checkboxes and radio buttons should only use their value if they're checked.
        // Also, custom elements that extend native elements (like an
        // `<input is="fancy-input">`) will appear in both lists. Since they
        // were already added as a custom element, they don't need
        // to be re-added.
        if (!this._useValue(el) ||
            (el.hasAttribute('is') && json[el.name])) {
          continue;
        }
        addSerializedElement(el);
      }

      return json;
    },

    _handleFormResponse: function (event) {
      this.fire('iron-form-response', event.detail);
    },

    _handleFormError: function (event) {
      this.fire('iron-form-error', event.detail);
    },

    _registerElement: function(e) {
      var element = e.target;
      element._parentForm = this;
      this._customElements.push(element);

      // Save the original value of this input.
      this._customElementsInitialValues.push(
          this._usesCheckedInsteadOfValue(element) ? element.checked : element.value);
    },

    _unregisterElement: function(e) {
      var target = e.detail.target;
      if (target) {
        var index = this._customElements.indexOf(target);
        if (index > -1) {
          this._customElements.splice(index, 1);
          this._customElementsInitialValues.splice(index, 1);
        }
      }
    },

    /**
     * Validates all the required elements (custom and native) in the form.
     * @return {boolean} True if all the elements are valid.
     */
    validate: function() {
      var valid = true;

      // Validate all the custom elements.
      var validatable;
      for (var el, i = 0; el = this._customElements[i], i < this._customElements.length; i++) {
        if (el.required && !el.disabled) {
          validatable = /** @type {{validate: (function() : boolean)}} */ (el);
          // Some elements may not have correctly defined a validate method.
          if (validatable.validate)
            valid = !!validatable.validate() && valid;
        }
      }

      // Validate the form's native elements.
      for (var el, i = 0; el = this.elements[i], i < this.elements.length; i++) {
        // Custom elements that extend a native element will also appear in
        // this list, but they've already been validated.
        if (!el.hasAttribute('is') && el.willValidate && el.checkValidity && el.name) {
          valid = el.checkValidity() && valid;
        }
      }

      return valid;
    },

    /**
     * Returns whether the given element is a radio-button or a checkbox.
     * @return {boolean} True if the element has a `checked` property.
     */
    _usesCheckedInsteadOfValue: function(el) {
      if (el.type == 'checkbox' ||
          el.type == 'radio' ||
          el.getAttribute('role') == 'checkbox' ||
          el.getAttribute('role') == 'radio' ||
          el._hasIronCheckedElementBehavior) {
        return true;
      }
      return false;
    },

    _useValue: function(el) {
      // Skip disabled elements or elements that don't have a `name` attribute.
      if (el.disabled || !el.name) {
        return false;
      }

      // Checkboxes and radio buttons should only use their value if they're
      // checked. Custom paper-checkbox and paper-radio-button elements
      // don't have a type, but they have the correct role set.
      if (this._usesCheckedInsteadOfValue(el))
        return el.checked;
      return true;
    },

    _doFakeSubmitForValidation: function() {
      var fakeSubmit = document.createElement('input');
      fakeSubmit.setAttribute('type', 'submit');
      fakeSubmit.style.display = 'none';
      this.appendChild(fakeSubmit);

      fakeSubmit.click();

      this.removeChild(fakeSubmit);
    },

    /**
     * Resets all non-disabled form custom elements to their initial values.
     */
    _resetCustomElements: function() {
      // Reset all the registered custom components. We need to do this after
      // the native reset, since programmatically changing the `value` of some
      // native elements (iron-input in particular) does not notify its
      // parent `paper-input`, which will now display the wrong value.
      this.async(function() {
        for (var el, i = 0; el = this._customElements[i], i < this._customElements.length; i++) {
          if (el.disabled)
            continue;

          if (this._usesCheckedInsteadOfValue(el)) {
            el.checked = this._customElementsInitialValues[i];
          } else {
            el.value = this._customElementsInitialValues[i];
          }
        }

        this.fire('iron-form-reset');
      }, 1);
    }

  });

