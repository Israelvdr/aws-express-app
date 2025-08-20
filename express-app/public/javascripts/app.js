const base_url = ""
const quiz_title = "AWS Quiz"

var question = {
  id: null,
  question: null,
  options: [''],
  choice: null
}

var progress = {
  answer_count: 0,
  score: 0,
  question_count: 0
}

var Choice = {
  click: function(n){
    return function(){
      const choice = option_num_to_char_index(n)
      question.choice = choice
    }
  },
  classes: function(n){
    const choice = option_num_to_char_index(n)
    if (question.choice === choice){
      return 'active'
    } else {
      return ''
    }
  },
  view: function(vnode){
    var n = vnode.attrs.index
    return m('.choice',{ class: Choice.classes(n), onclick: Choice.click(n) },
      m('span.l'),
      m('span.v',question.options[n])
    )
  }
}

const option_to_Choice = function(option, i, arr){
  return m(Choice,{index: i})
}

const option_num_to_char_index = function(i){
  const char_val = 'A'.charCodeAt(0)+i
  return String.fromCharCode(char_val)
}

const next_question = function() {
	m.request({
		method: "GET",
		url: base_url+"/questions/next",
	})
	.then(function(data) {
    question.id = data?.id
		question.question = data?.question
    question.options = data?.options
    question.choice = null
	})
}

const get_progress = function(){
	m.request({
		method: "GET",
		url: base_url+"/answers/progress",
	})
	.then(function(data) {
    progress.answer_count = parseInt(data.answer_count)
    progress.score = parseInt(data.score)
    progress.question_count = parseInt(data.question_count)
	})
}

const submit = async function(){
  // Don't allow submit if:
  //  all questions have been answered,
  //  if there's no question,
  //  or if there's no choice selected.
  if (progress.answer_count===progress.question_count
    || question.question_id===null
    || question.choice===null) {
    return
  }

  await m.request({
      method: "POST",
      url: base_url+"/answers",
      body: {
        question_id: question.id,
        choice: question.choice
      },
  })
  .then(function(data) {
    console.log('data',data.is_correct)
  })
  next();
}

const reset = async function(){
  await m.request({
      method: "POST",
      url: base_url+"/answers/reset"
  })
  next();
}

const next = function(){
  get_progress()
  next_question()
}

const init = function(){
  next()
}

const render_questions = function(){
  if (progress.answer_count===progress.question_count) {
    return [
      m('h2','Quiz complete!'),
      m('div','You have answered all available questions.')
    ]
  } else if (question.question_id===null) {
    return [
      m('h2','Error:'),
      m('div','No question found')
    ]
  } else {
    return [
      m('h2','Question:'),
      m('.question',question.question),
      question.options.map(option_to_Choice),
      m('.submit',
        m("button", {onclick: App.submit}, 'Submit')
      )
    ]
  }
}

const render_progress = function(){
  if (progress.answer_count===progress.question_count) {
    return [
        m('h2','Score:'),
        m(
          '.div',
          `${progress.score}/${progress.question_count} total, `+
          `(${progress.answer_count!==0 ? (progress.score)/progress.answer_count*100 : 0}%)`
        )
    ]
  } else {
    return [
        m('h2','Progress:'),
        m(
          '.div',
          `Question: ${progress.answer_count+1}/${progress.question_count}`
        ),
        m(
          '.div',
          `Score: ${progress.score}/${progress.question_count} total,`+
          `${progress.score}/${progress.answer_count} current `+
          `(${progress.answer_count!==0 ? (progress.score)/progress.answer_count*100 : 0}%)`
        )
    ]
  }
}

init()

var App = {
  submit: submit,
  reset: reset,
  view: function() {
    return m('main', [
      m("h1", quiz_title),
      m('article', 
        m('.questions', render_questions())
      ),
      m('article',
        m('.progress', render_progress()),
        m('.reset',
          m("button", {onclick: App.reset}, 'Reset')
        )
      )
    ])
  }
}

m.mount(document.body, App)
