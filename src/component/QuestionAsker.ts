import Vue = require("../vue");
import {Answer} from "../model/Answer";

const TEMPLATE = "<div class='question-asker'><h2>Question {{ questionNo }}</h2>" +
    "<div class='question'>Question: {{ question.wording }}</div>" +
    "<ul><li v-for='answer in question.answers' @click='answerSelected(answer)'>{{ answer.wording }}</li>" +
    "</ul></div>";

export var CategorySelector = Vue.extend({
    template: TEMPLATE,
    props: ["question"],
    methods: {
        answerSelected: function (answer: Answer) {
            console.log(this.question, answer);
            this.$root.setAnswer(answer);
            this.$root.nextQuestion();
        }
    },
});

Vue.component("question-asker", CategorySelector);