/* global language */
const transliterationURL = 'https://api.varnamproject.com/tl';
const codes = {
    assamese: 'as',
    bengali: 'bn',
    gujarati: 'gu',
    hindi: 'hi',
    kannada: 'kn',
    malayalam: 'ml',
    nepali: 'ne',
    oriya: 'or',
    punjabi: 'pa',
    tamil: 'ta',
    telugu: 'te',
};

// eslint-disable-next-line func-names
document.querySelector('#sendMessage>input').addEventListener('input', async function () {
    document.querySelector('#suggestions').innerHTML = '';
    if (language === 'English' || this.value.trim() === '') return;
    const text = this.value;
    const res = await fetch(`${transliterationURL}/${codes[language.toLowerCase()]}/${text}`);
    const data = await res.json();
    const suggestions = data.result;
    suggestions.forEach((suggestion) => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        li.classList.add('list-group-item', 'list-group-item-action');
        li.addEventListener('click', () => { this.value = suggestion; });
        document.querySelector('#suggestions').appendChild(li);
    });
});
