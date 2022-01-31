const socket = io();


// Elements 
const $messageForm = document.querySelector('.form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')

const $sendLocationButton = document.querySelector('#send_location');

const $messages = document.querySelector('#messages');


// Templates
const messageTemplate = document.querySelector('#message_template').innerHTML
const locationMessageTemplate = document.querySelector('#location_message_template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar_template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix : true,       // will remove question mark from url
})

// AutoScrolling
function autoscroll(){
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}


// receiving message
socket.on('message', (message) => {
    console.log(message)
    // rendering to the screen(on page)
    const html = Mustache.render(messageTemplate, {
        username : message.username,
        message : message.text,
        // createdAt : message.createdAt,
        createdAt : moment(message.createdAt).format('HH:mm'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

// receiving location
socket.on('locationMessage', (message) => {
    console.log(message)
    const html = Mustache.render(locationMessageTemplate, {
        username : message.username,
        url : message.url,
        createdAt : moment(message.createdAt).format('HH:mm'),
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // disable
    $messageFormButton.setAttribute('disabled', 'disabled')

    // let input = document.querySelector('#inp');
    // let message = input.value;
    let message = e.target.elements.message.value;

    socket.emit('sendMessage', message, (error) => {
        // enable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus();

        if(error){
            return console.log(error)
        }
        console.log(message, 'was delivered!')
    })
})

$sendLocationButton.addEventListener('click', (e) => {
    const location = navigator.geolocation;
    if(!location)
        return alert('Geolocation is not supported by your browser')
    
    // disable button
    $sendLocationButton.setAttribute('disabled', 'disabled');

    location.getCurrentPosition( (position) => {
        socket.emit('sendLocation', {
            latitude : position.coords.latitude,
            longitude : position.coords.longitude,
        }, () => {
            console.log('Loaction shared')
            // enabling button
            $sendLocationButton.removeAttribute('disabled')
        });
    })
})

socket.emit('join', {
    username,
    room,
}, (error) => {
    if(error){
        alert(error)
        location.href = './'
    }
})







// ////////////////////////////////////////////////////////////////////

// socket.on('countUpdated', (count) => {
//     console.log('updated value', count)
// })
// socket.on('datafromserver', (val) => {
//     console.log(val)
// })

// let val = document.querySelector('#inp');

// document.querySelector('#increment').addEventListener('click', function(){
    // socket.emit('increment')
    // socket.emit('datas', val.value)
    // val.value = ''
// })
