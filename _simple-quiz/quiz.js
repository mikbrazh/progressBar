/* ======= quizData START ======= */
const quizData = [{
  number: 1,
  title: "На какую сумму вы рассчитываете?",
  answer_alias: "money",
  answers: [{
    answer_title: "500 рублей",
    type: "checkbox"
  },
  {
    answer_title: "5000 рублей",
    type: "checkbox"
  },
  {
    answer_title: "Введу текстом",
    type: "text"
  }
  ]
},
{
  number: 2,
  title: "Какой именно вам нужен сайт?",
  answer_alias: "great",
  answers: [{
    answer_title: "Лендинг-пейдж",
    type: "radio"
  },
  {
    answer_title: "Корпоративный сайт",
    type: "radio"
  },
  {
    answer_title: "Интернет-магазин",
    type: "radio"
  }
  ]
},
{
  number: 3,
  title: "Еще один вопрос",
  answer_alias: "another",
  answers: [{
    answer_title: "Вопрос 1",
    type: "radio"
  },
  {
    answer_title: "Вопрос 2",
    type: "radio"
  },
  {
    answer_title: "Вопрос 3",
    type: "radio"
  },
  ]
},
  // {
  //   number: 4,
  //   title: "Оставьте свой телефон, мы вам перезвоним",
  //   answer_alias: "phone",
  //   answers: [{
  //     answer_title: "Введите телефон",
  //     type: "text"
  //   },
  //   ]
  // }
];
/* ======= quizData END ======= */

/* ======= quizTemplate START ======= */
const quizTemplate = (data = [], dataLength = 0, options) => {
  const { number, title } = data;
  const { nextBtnText } = options;
  const answers = data.answers.map(item => {
    return `
      <label class="quiz-question__label">
        <input type="${item.type}" data-valid="false" class="quiz-question__answer" name="${data.answer_alias}" ${item.type == 'text' ? 'placeholder="Введите ваш вариант"' : ''} value="${item.type !== 'text' ? item.answer_title : ''}">
        <span>${item.answer_title}</span>
      </label>
    `;
  });

  return `
    <div class="quiz__content">
      <div class="quiz__questions">${number} из ${dataLength}</div>
      <div class="quiz-question">
        <h3 class="quiz-question__title">${title}</h3>
        <div class="quiz-question__answers">
          ${answers.join('')}
        </div>
        <button type="button" class="quiz-question__btn" data-next-btn>${nextBtnText}</button>
      </div>
    </div>
  `
};
/* ======= quizTemplate END ======= */

/* ======= class Quiz START ======= */
class Quiz {
  constructor(selector, data, options) {
    this.$el = document.querySelector(selector);
    this.options = options;
    this.data = data;
    this.counter = 0;
    this.dataLength = this.data.length;
    this.resultArray = [];
    this.tmp = {};
    this.init()
    this.events()
  }

  init() {
    console.log('init!');
    this.$el.innerHTML = quizTemplate(this.data[this.counter], this.dataLength, this.options);
  }

  nextQuestion() {
    console.log('next question!');

    if (this.valid()) {

      if (this.counter + 1 < this.dataLength) {
        this.counter++;
        this.$el.innerHTML = quizTemplate(this.data[this.counter], this.dataLength, this.options);

        if ((this.counter + 1 == this.dataLength)) {
          this.$el.insertAdjacentHTML('beforeend', `<button type="button" data-send>${this.options.sendBtnText}</button>`)
          this.$el.querySelector('[data-next-btn]').remove();
        }
      } else {
        console.log('А все! конец!');
      }

      progressBar.increaseProgress();

    } else {
      console.log('Не валидно!')
    }
  }

  events() {
    console.log('events!')
    this.$el.addEventListener('click', (e) => {
      if (e.target == document.querySelector('[data-next-btn]')) {
        this.addToSend();
        this.nextQuestion();
      }

      if (e.target == document.querySelector('[data-send]')) {
        this.send();
      }
    });

    this.$el.addEventListener('change', (e) => {
      if (e.target.tagName == 'INPUT') {
        if (e.target.type !== 'checkbox' && e.target.type !== 'radio') {
          let elements = this.$el.querySelectorAll('input')

          elements.forEach(el => {
            el.checked = false;
          });
        }
        this.tmp = this.serialize(this.$el);
      }
    });
  }

  valid() {
    let isValid = false;
    let elements = this.$el.querySelectorAll('input')
    elements.forEach(el => {
      switch (el.nodeName) {
        case 'INPUT':
          switch (el.type) {
            case 'text':
              if (el.value) {
                isValid = true;
              } else {
                el.classList.add('error')
              }
            case 'checkbox':
              if (el.checked) {
                isValid = true;
              } else {
                el.classList.add('error')
              }
            case 'radio':
              if (el.checked) {
                isValid = true;
              } else {
                el.classList.add('error')
              }
          }
      }
    });

    return isValid;
  }

  addToSend() {
    this.resultArray.push(this.tmp)
  }

  send() {
    if (this.valid()) {
      const formData = new FormData();

      for (let item of this.resultArray) {
        for (let obj in item) {
          formData.append(obj, item[obj].substring(0, item[obj].length - 1));
        }
      }

      const response = fetch("mail.php", {
        method: 'POST',
        body: formData
      });
    }
  }

  serialize(form) {
    let field, s = {};
    let valueString = '';
    if (typeof form == 'object' && form.nodeName == "FORM") {
      let len = form.elements.length;
      for (let i = 0; i < len; i++) {
        field = form.elements[i];

        if (field.name && !field.disabled && field.type != 'file' && field.type != 'reset' && field.type != 'submit' && field.type != 'button') {
          if (field.type == 'select-multiple') {
            for (j = form.elements[i].options.length - 1; j >= 0; j--) {
              if (field.options[j].selected)
                s[s.length] = encodeURIComponent(field.name) + "=" + encodeURIComponent(field.options[j].value);
            }
          } else if ((field.type != 'checkbox' && field.type != 'radio' && field.value) || field.checked) {
            valueString += field.value + ',';

            s[field.name] = valueString;
          }
        }
      }
    }
    return s
  }
}
/* ======= class Quiz END ======= */

/* ======= class ProgressBar START ======= */
class ProgressBar {
  constructor(target, options) {
    this.target = target;
    this.targetElem = document.querySelector(this.target);

    (options.zeroStart === false || options.zeroStart === 0) ?
      this.zeroStart = false :
      this.zeroStart = true;

    (options.smoothProgress === true || options.smoothProgress === 1 || options.smoothProgress === undefined) ?
      this.smoothProgress = true :
      this.smoothProgress = false;

    (options.completeEnd === true || options.completeEnd === 1) ?
      this.completeEnd = true :
      this.completeEnd = false;

    if (this.zeroStart === false) this.completeEnd = false;

    // The number property from the last element of the array
    this.completeEnd ? this.numberOfQuestions = quizData[quizData.length - 1].number - 1 : this.numberOfQuestions = quizData[quizData.length - 1].number;

    // How many percent of the total number of questions is one question
    this.percentOfOneQuestion = Math.ceil(100 / this.numberOfQuestions);
    this.zeroStart ? this.value = 0 : this.value = this.percentOfOneQuestion;

    this.init();
  }

  init() {
    if (this.targetElem) {
      const quizProgressBarHTML = `
      <div class="quiz-progress-bar">
        <div class="quiz-progress-bar__value">${this.value}%</div>
        <div class="quiz-progress-bar__bar">
          <div class="quiz-progress-bar__progress">
            <span class="quiz-progress-bar__progress-value">${this.value}%</span>
          </div>
        </div>
      </div>
    `;

      this.targetElem.insertAdjacentHTML('afterbegin', quizProgressBarHTML);

      const $__quizProgressBarValue = this.targetElem.querySelector('.quiz-progress-bar__value');
      $__quizProgressBarValue.textContent = this.value + '%';

      const $__quizProgressBarProgress = this.targetElem.querySelector('.quiz-progress-bar__progress');
      $__quizProgressBarProgress.style.width = `${this.value}%`;

      const $__quizProgressBarProgressValue = this.targetElem.querySelector('.quiz-progress-bar__progress-value');
      $__quizProgressBarProgressValue.textContent = this.value + '%';

      console.log('class ProgressBar -> init() => init!');
    } else {
      console.log(`class ProgressBar -> init() => Couldn't find target element ${this.target}!`);
      this.increaseProgress = () => { return };
    }
  }

  increaseProgress() {
    if (this.smoothProgress) {
      if (this.value < 100) {
        let value = this.value;
        this.value += this.percentOfOneQuestion;

        const interval = setInterval(smoothProgress.bind(this), 15);

        function smoothProgress() {
          if (value <= this.value && value <= 100) {
            console.log(`class ProgressBar -> increaseProgress() => ${value}`);

            const $__quizProgressBarValue = this.targetElem.querySelector('.quiz-progress-bar__value');
            $__quizProgressBarValue.textContent = `${value}%`;

            const $__quizProgressBarProgress = this.targetElem.querySelector('.quiz-progress-bar__progress');
            $__quizProgressBarProgress.style.width = `${value}%`;

            const $__quizProgressBarProgressValue = this.targetElem.querySelector('.quiz-progress-bar__progress-value');
            $__quizProgressBarProgressValue.textContent = `${value}%`;

            value++;
          }
        }
      }
      else {
        return;
      }
    } else {
      this.value += this.percentOfOneQuestion;

      console.log(`class ProgressBar -> increaseProgress() => ${this.value}`);

      const $__quizProgressBarValue = this.targetElem.querySelector('.quiz-progress-bar__value');
      $__quizProgressBarValue.textContent = `${this.value}%`;

      const $__quizProgressBarProgress = this.targetElem.querySelector('.quiz-progress-bar__progress');
      $__quizProgressBarProgress.style.width = `${this.value}%`;

      const $__quizProgressBarProgressValue = this.targetElem.querySelector('.quiz-progress-bar__progress-value');
      $__quizProgressBarProgressValue.textContent = `${this.value}%`;
    }
  }
}
/* ======= class ProgressBar END ======= */

/* ======= Instances of classes START ======= */
window.quiz = new Quiz('.quiz', quizData, {
  nextBtnText: "Далее",
  sendBtnText: "Отправить",
});

const progressBar = new ProgressBar('.quiz-wrapper', { // Options:
  // smoothProgress: false, // Makes progress smooth/sharp. DEFAULT VALUE = true
  // zeroStart: false, // Sets the initial value to 0. DEFAULT VALUE = true
  // completeEnd: true, // Every time completes progress at 100%. DEFAULT VALUE = false
});
/* ======= Instances of classes END ======= */