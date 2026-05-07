const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

Dimu.elements = [];

function Dimu(options = {}) {
  this.opt = Object.assign(
    {
      destroyOnClose: true,
      footer: false,
      cssClass: [],
      closeMethods: ["button", "overlay", "escape"],
    },
    options,
  );
  this.template = $(`#${this.opt.templateId}`);

  if (!this.template) {
    console.error(`#${this.opt.templateId} does not exist!`);
    return;
  }

  const { closeMethods } = this.opt;
  this._allowButtonClose = closeMethods.includes("button");
  this._allowBackdropClose = closeMethods.includes("overlay");
  this._allowEscapeClose = closeMethods.includes("escape");

  this._footerButtons = [];

  this._handleEscapeKey = this._handleEscapeKey.bind(this);
}

Dimu.prototype._build = function () {
  const content = this.template.content.cloneNode(true);

  // Create modal elements
  this._backdrop = document.createElement("div");
  this._backdrop.className = "dimu__backdrop";

  const container = document.createElement("div");
  container.className = "dimu__container";

  this.opt.cssClass.forEach((className) => {
    if (typeof className === "string") {
      container.classList.add(className);
    }
  });

  if (this._allowButtonClose) {
    const closeBtn = this._createButton("&times;", "dimu__close", () =>
      this.close(),
    );
    container.append(closeBtn);
  }

  const modalContent = document.createElement("div");
  modalContent.className = "dimu__content";

  // Append content and elements
  modalContent.append(content);
  container.append(modalContent);

  if (this.opt.footer) {
    this._modalFooter = document.createElement("div");
    this._modalFooter.className = "dimu__footer";

    this._renderFooterContent();
    this._renderFooterButtons();

    container.append(this._modalFooter);
  }

  this._backdrop.append(container);
  document.body.append(this._backdrop);
};

Dimu.prototype.setFooterContent = function (html) {
  this._footerContent = html;
  this._renderFooterContent();
};

Dimu.prototype.addFooterButton = function (title, cssClass, callback) {
  const button = this._createButton(title, cssClass, callback);
  this._footerButtons.push(button);
  this._renderFooterButtons();
};

Dimu.prototype._renderFooterContent = function () {
  if (this._modalFooter && this._footerContent) {
    this._modalFooter.innerHTML = this._footerContent;
  }
};

Dimu.prototype._renderFooterButtons = function () {
  if (this._modalFooter) {
    this._footerButtons.forEach((button) => {
      this._modalFooter.append(button);
    });
  }
};

Dimu.prototype._createButton = function (title, cssClass, callback) {
  const button = document.createElement("button");
  button.className = cssClass;
  button.innerHTML = title;
  button.onclick = callback;

  return button;
};

Dimu.prototype.open = function () {
  Dimu.elements.push(this);

  if (!this._backdrop) {
    this._build();
  }

  setTimeout(() => {
    this._backdrop.classList.add("dimu--show");
  }, 0);

  // Disable scrolling
  document.body.classList.add("dimu--no-scroll");
  document.body.style.paddingRight = this._getScrollbarWidth() + "px";

  // Attach event listeners
  if (this._allowBackdropClose) {
    this._backdrop.onclick = (e) => {
      if (e.target === this._backdrop) {
        this.close();
      }
    };
  }

  if (this._allowEscapeClose) {
    document.addEventListener("keydown", this._handleEscapeKey);
  }

  this._onTransitionEnd(this.opt.onOpen);

  return this._backdrop;
};

Dimu.prototype._handleEscapeKey = function (e) {
  const lastModal = Dimu.elements[Dimu.elements.length - 1];
  if (e.key === "Escape" && this === lastModal) {
    this.close();
  }
};

Dimu.prototype._onTransitionEnd = function (callback) {
  this._backdrop.ontransitionend = (e) => {
    if (e.propertyName !== "transform") return;
    if (typeof callback === "function") callback();
  };
};

Dimu.prototype.close = function (destroy = this.opt.destroyOnClose) {
  Dimu.elements.pop();

  this._backdrop.classList.remove("dimu--show");

  if (this._allowEscapeClose) {
    document.removeEventListener("keydown", this._handleEscapeKey);
  }

  this._onTransitionEnd(() => {
    if (this._backdrop && destroy) {
      this._backdrop.remove();
      this._backdrop = null;
      this._modalFooter = null;
    }

    // Enable scrolling
    if (!Dimu.elements.length) {
      document.body.classList.remove("dimu--no-scroll");
      document.body.style.paddingRight = "";
    }

    if (typeof this.opt.onClose === "function") this.opt.onClose();
  });
};

Dimu.prototype.destroy = function () {
  this.close(true);
};

Dimu.prototype._getScrollbarWidth = function () {
  if (this._scrollbarWidth) return this._scrollbarWidth;

  const div = document.createElement("div");
  Object.assign(div.style, {
    overflow: "scroll",
    position: "absolute",
    top: "-9999px",
  });

  document.body.appendChild(div);
  this._scrollbarWidth = div.offsetWidth - div.clientWidth;
  document.body.removeChild(div);

  return this._scrollbarWidth;
};

const modal1 = new Dimu({
  templateId: "modal-1",
  destroyOnClose: false,
  onOpen: () => {
    console.log("Modal 1 opened");
  },
  onClose: () => {
    console.log("Modal 1 closed");
  },
});

$("#open-modal-1").onclick = () => {
  modal1.open();
};

const modal2 = new Dimu({
  templateId: "modal-2",
  closeMethods: ["button"],
  cssClass: ["class1", "class2", "classN"],
  onOpen: () => {
    console.log("Modal 2 opened");
  },
  onClose: () => {
    console.log("Modal 2 closed");
  },
});

$("#open-modal-2").onclick = () => {
  const modalElement = modal2.open();

  const form = modalElement.querySelector("#login-form");
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const formData = {
        email: $("#email").value.trim(),
        password: $("#password").value.trim(),
      };

      console.log(formData);
    };
  }
};

const modal3 = new Dimu({
  templateId: "modal-3",
  footer: true,
  onOpen: () => {
    console.log("Modal 3 opened");
  },
  onClose: () => {
    console.log("Modal 3 closed");
  },
});

// modal3.setFooterContent("<h2>Footer content</h2>");

modal3.addFooterButton(
  "Danger",
  "dimu__btn dimu__btn--danger dimu__btn--pull-left",
  (e) => {
    alert("Danger clicked!");
  },
);

modal3.addFooterButton("Cancel", "dimu__btn", (e) => {
  modal3.close();
});

modal3.addFooterButton(
  "<span>Agree</span>",
  "dimu__btn dimu__btn--primary",
  (e) => {
    modal3.close();
  },
);

$("#open-modal-3").onclick = () => {
  modal3.open();
};
