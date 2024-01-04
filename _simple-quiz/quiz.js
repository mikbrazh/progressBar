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
    title: "Оставьте свой телефон, мы вам перезвоним",
    answer_alias: "phone",
    answers: [{
      answer_title: "Введите телефон",
      type: "text"
    },
    ]
  }
];


const quizTemplate = (data = [], dataLength = 0, options) => {
  const {number, title} = data;
  const {nextBtnText} = options;
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
      <div class="quiz-progress-bar">
                <div class="quiz-progress-bar__value"></div>
                    <div class="quiz-progress-bar__bar">
                    <div class="quiz-progress-bar__progress"></div>
                </div>
            </div>
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
      switch(el.nodeName) {
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

class ProgressBar {
    constructor(target, options) {
        // Берем свойство number у последнего элемента массива (-1 ОПИСАТЬ !!!)
        this.numberOfQuestions = quizData[quizData.length - 1].number;
        this.numberOfQuestions = quizData[quizData.length - 1].number - 1;
        // Узнаем сколько процентов от общего колличества вопросов занимает один вопрос
        this.percentOfOneQuestion = Math.ceil(100 / this.numberOfQuestions);
        // this.value = this.percentOfOneQuestion;
        this.value = 0; // 2ОПИСАТЬ!!!
        this.target = target;
        this.btnPrev = options.btnPrev;
        this.btnNext = options.btnNext;

        this.init();
    }

    init() {
        const $__target = document.querySelector(this.target);
        const $__quizHTML = `
            <div class="quiz-progress-bar">
                <div class="quiz-progress-bar__value">${this.value}%</div>
                    <div class="quiz-progress-bar__bar">
                    <div class="quiz-progress-bar__progress">${this.value}%</div>
                </div>
            </div>
        `;
        // $__target.insertAdjacentHTML('beforebegin', $__quizHTML);

        // const $__targetWidth = $__target.offsetWidth;
        // const $__quizProgressBar = document.querySelector('.quiz-progress-bar');
        // $__quizProgressBar.style.width = $__targetWidth + 'px';
        // $__quizProgressBar.style.margin = '0 auto 20px';

        const $__quizProgressBarProgress = document.querySelector('.quiz-progress-bar__progress');
        $__quizProgressBarProgress.textContent = this.value + '%';
        $__quizProgressBarProgress.style.width = `${this.value}%`;

        const $__quizProgressBarValue = document.querySelector('.quiz-progress-bar__value');
        $__quizProgressBarValue.textContent = this.value + '%';

        const btnPrev = document.querySelector(this.btnPrev);
        const btnNext = document.querySelector(this.btnNext);

        if (btnPrev) {
            btnPrev.addEventListener('click', ()=> {
                progressBar.reduceProgress();
            });
        }

        if (btnNext) {
            btnNext.addEventListener('click', ()=> {
                progressBar.increaseProgress();
            });
        }
    }

    increaseProgress() {
        if (this.value < 100) {
            this.value += this.percentOfOneQuestion;
            if (this.value >= 100) {
                const $__quizProgressBarValue = document.querySelector('.quiz-progress-bar__value');
                const $__quizProgressBarProgress = document.querySelector('.quiz-progress-bar__progress');
                $__quizProgressBarValue.textContent = 100 + '%';
                $__quizProgressBarProgress.textContent = 100 + '%';
                $__quizProgressBarProgress.style.width = 100 + '%';
            } else {



            // const interval = setInterval(moveFrame, 15);

            // let width = 0;
            // function moveFrame() {
                
            //     if (width >= this.step || width >= 100) {
            //         clearInterval(interval);
            //         width = this.width;
            //         this.step += this.initialStep;
            //     } else {
            //         width++;
            //         $el__value.innerHTML = width + "%";
            //         $el__progress.innerHTML = width + "%";
            //         $el__progress.style.width = width + "%";
            //     }
            // }


                const $__quizProgressBarValue = document.querySelector('.quiz-progress-bar__value');
                const $__quizProgressBarProgress = document.querySelector('.quiz-progress-bar__progress');
                $__quizProgressBarValue.textContent = `${this.value}%`;
                $__quizProgressBarProgress.textContent = `${this.value}%`;
                $__quizProgressBarProgress.style.width = `${this.value}%`;
            }
        }
        else {
            return;
        }
    }

    reduceProgress() {
        if (this.value > this.percentOfOneQuestion) {

            this.value -= this.percentOfOneQuestion;

            const $__quizProgressBarValue = document.querySelector('.quiz-progress-bar__value');
            const $__quizProgressBarProgress = document.querySelector('.quiz-progress-bar__progress');
            $__quizProgressBarValue.textContent = `${this.value}%`;
            $__quizProgressBarProgress.textContent = `${this.value}%`;
            $__quizProgressBarProgress.style.width = `${this.value}%`;
        }
        else if (this.value <= 0) {
            const $__quizProgressBarValue = document.querySelector('.quiz-progress-bar__value');
            const $__quizProgressBarProgress = document.querySelector('.quiz-progress-bar__progress');
            $__quizProgressBarValue.textContent = 0 + '%';
            $__quizProgressBarProgress.textContent = 0 + '%';
            $__quizProgressBarProgress.style.width = 0 + '%';

            return
        }
        else {
            return;
        }
    }
}

window.quiz = new Quiz('.quiz', quizData, {
  nextBtnText: "Далее",
  sendBtnText: "Отправить",
});

const progressBar = new ProgressBar('.quiz', {
    // btnPrev: '.btsn-prev',
    // btnNext: '.quiz-question__btn',
});