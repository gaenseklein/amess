const ONEDAY = 24*60*60*1000
const ONEWEEK = ONEDAY * 7
const WEEKSTRING = ['So','Mo','Di','Mi','Do','Fr','Sa']
/**
 * creates html for groupoverviews/startingpage element 
 * @param {Object} data - the data to use for the element
 * @param {string} data.id - id of the element
 * @param {string} data.icon - icon to use for the element
 * @param {string} data.name - the groupname 
 * @param {object} data.last_message - last message of group
 * @param {string} data.last_message.name - last message of group
 * @param {string} data.last_message.message - last message of group
 * @param {date} data.date - the date of the last message
 * @param {number} data.unread_count - the count of unread messages in a group
 * @param {number} data.read_status - if message was read (only on vis-a-vis-chat) 
 * @param {Object[]} data.messages -  the messages of the groupoverview
 */
function template_groupoverview_element(data){
	console.log('groupoverview element',data)
	let time_string = template_time_passed(data.last_update)
	// let avatar = `<div class="avatar empty"></div>`
	// if(data.icon){
		// avatar = `<div class="avatar"><img src="/img/${data.icon}"></div>`
	// }
	let avatar = template_avatar(data.icon)
	let lm = ''
	// if(data.last_message){
		// lm = data.last_message.message
		// if(data.last_message.name){
			// lm = data.last_message.name + lm
		// }
	// }
	if(data.messages && data.messages.length>0){
		let lastm = data.messages[data.messages.length-1]
		if(lastm.name){
			lm = `<span class="chatname">${lastm.name}: </span><span class="chatmessage">${lastm.message}</span>`	
		}else {
			lm = `<span class="chatmessage">${lastm.message}</span>`
		}
	}
	
	let count = ''
	if(data.unread_count > 0){
		count = `<div class="count">${data.unread_count}</div>`		
	}
	let readstatus = ''
	if(data.read_status>1){
				readstatus+='✓'
		}
	if(data.read_status>0){
		readstatus+='✓'
		count = `<div class="readstatus">${readstatus}</div>`
	}
	
	
	let result = `
<button class="overviewelement" onclick="amess.show_group('${data.id}')">
	${avatar}
	<div class="title">${data.name}</div>
	<div class="last_message">${lm}</div>
	<div class="date">${time_string}</div>
	${count}
</button>
	`
	return result
}

function template_time_passed(date){
	let time_passed = Date.now() - date
	let minutes = date.getMinutes() + ""
	if(minutes.length==1)minutes = "0"+minutes
	let time_string = date.getHours() + ':' + minutes
	if(time_passed > ONEDAY){
		time_string = WEEKSTRING[date.getDay()]
	}
	if(time_passed > ONEWEEK){
		time_string = date.toLocaleDateString('de')
	}
	return time_string
}

function template_avatar(icon){
	let avatar_icon = ""
	let classlist = "avatar"
	if(icon)avatar_icon = `<img src="${icon}">`
	else classlist = "avatar empty"
	return `<div class="${classlist}">${avatar_icon}</div>`
}

function template_backlink(){
	return `<button class="back_link" onclick="amess.back()">⬅</button>`	
}
/**
 * @param {Object} options
 * callback_function, callback_params, prompt_id
 * 
**/
function template_posting_prompt(options){
	id = options.prompt_id 
	cb = options.callback_function
	param = options.callback_params
	cb+=`(${id}.value, '${param}');`
	return `<div class="prompt-wrapper">
	        	<button class="fileupload" onclick="amess.uploadFile('${param}')">📎</button>	
	        	<textarea class="prompt" id="${id}" type="text" 
	        	placeholder="write your message here"	        	
	        	onkeypress="console.log(event);if(event.key=='Enter' && !event.shiftKey)${cb}"></textarea>
	        	<button class="send" onclick="${cb}">🖅</button>	
	        </div>`
}

function template_chat_element(data, options){
	console.log('chat element', data, options);
	let avatar = ''
	if(!options || !options.without_avatar)avatar = template_avatar(data.icon)
	let timestring = template_time_passed(data.date)
	let readstatus = ''
	if(data.read_status>1){
				readstatus+='✓'
		}
	if(data.read_status>0){
		readstatus+='✓'		
	}
	let result = `
	<div class="message_wrapper" id="mw_${data.id}">
		${avatar}
		<div class="message_box" id="message_${data.id}">
			<div class="message_username">${data.name}</div>
			<div class="message_text">${data.message}</div>
			<div class="message_meta">
				<div class="message_time_passed">${timestring}</div>
				<div class="message_read_status">${readstatus}</div>
			</div>
		</div>
	</div>
	`
	return result
}

function template_chat_header(group){
	let avatar = template_avatar(group.icon)
	let result = `
<div class="group_header header">
	${template_backlink()}
	<button class="group_name_button" onclick="amess.show_group_details('${group.id}')">
		${avatar}
		<div class="group_name title">${group.name}</div>
		<div class="group_membercount">${group.members.length} Mitglieder</div>
	</button>
	<button class="standard search" onclick="amess.show_search('${group.id}')">🔍</button>
	<button class="standard hamburger" onclick="amess.show_group_options('${group.id}')">⁞</button>
</div>
	`	
	return result
}
/**
 * creates html for groupoverviews/startingpage element 
 * @param {Object} activity - the data to use for the element
 * @param {string} activity.group_id - id of the group the activity is linked to
 * @param {string} activity.type - type of activity, eg. calendar, task... 
 * @param {number} activity.count_total - count how many activitys 
 * @param {number} activity.count_open - if message was read (only on vis-a-vis-chat)
 */

function template_chat_activity_button(activity){
	let count_total = ''
	if(activity.count_total > 1)count_total = `<div class="count total">${activity.count_total}</div>`
	let count_open = ''
	if(activity.count_open)count_open = `<div class="count open">${activity.count_open}</div>`
	let result = `
<div class="activity">
	<button class="standard" onclick="amess.show_activity('${activity.id}','${activity.group_id}','${activity.type}')">
		<img src="img/button/activity/${activity.type}.png">
	</button>
	${count_total}
	${count_open}
</div>
	`
	return result
}

function template_chat_extra_message(message, options){
	let result = `<div class="extra_message">${message}</div>`
	return result
}

function template_task(task, uid){
	let task_date = task.start_date.toLocaleDateString('de')+' - '+task.start_date.toLocaleTimeString('de')
	let teilnehmer = ""
	let user_has_task = false
	let accept = "Aufgabe übernehmen"
	let checked = ""
	for(let i=0;i<task.participants.length;i++){
		teilnehmer += `<span>${task.participants[i].name}</span>`
		if(task.participants[i].uid==uid){
			user_has_task=true
			accept = "Aufgabe abgeben"
			checked = "checked"
		}
	}	
	
	let result = `<div class="header">
		${template_backlink()}
		<div class="title">
			${task.name}
		</div>
	</div>
	<div class="activity_buttons">
	<!--
	<label for="task_accept">${accept}</label>
	<input type="checkbox" ${user_has_task}>
		-->
		<button class="accept_task" onclick="amess.accept_task('${task.id}', ${user_has_task})">
			${accept}
		</button>		
	</div>
	<div class="task_date">${task_date}</div>
	<div class="task_members">
		<div class="title">
			Teilnehmer
		</div>
		${teilnehmer}
	</div>
	<div class="task_description">
		${task.description}
	</div>
	`
	return result
}

function template_task_overview_element(data){
	let time_string = template_time_passed(data.last_update)
	let avatar = template_avatar(data.icon)
	let starts_at = data.start_date.toLocaleDateString('de') + " - " + data.start_date.toLocaleTimeString('de')
	let open_participants = data.max_participants - data.participants.length
	let count_class = ""
	if(open_participants==0)count_class=" full"
	let count =  `<div class="count${count_class}">${data.participants.length}/${data.max_participants}</div>`		
	let result = `
<button class="overviewelement" onclick="amess.show_activity('${data.id}')">
	${avatar}
	<div class="title"><span class="task_type">${data.type}:</span><span>${data.name}</span></div>
	<div class="last_message">
		<div class="start_date">Beginn: ${starts_at}</div>
		<div class="message">Dauer: ${data.duration} min</div>
	</div>
	${count}
	<div class="date">${time_string}</div>
	${count}
</button>
	`
	return result

}
/**
 * @param {Object} tasks - collected tasks
 * @param {string} tasks.open - open tasks
 * @param {string} tasks.closed - closed tasks
 * @param {string} tasks.own - tasks user participates to
 */
function template_task_overview(tasks){
	let result = `
	<div class="own">${tasks.own}</div>
	<div class="open">${tasks.open}</div>
	<div class="closed">${tasks.closed}</div>
	`
	return result
}

function template_task_overview_header(){
	let result = `
<div class="header">
	${template_backlink()}
	<div class="title">
		Aufgabenübersicht
	</div>
</div>
<div class="activity_buttons task_overview">
	<button onclick="amess.show_activity_overview_tab('own')" class="own">meine</button>	
	<button onclick="amess.show_activity_overview_tab('open')" class="open">offene</button>	
	<button onclick="amess.show_activity_overview_tab('closed')" class="closed">geschlossene</button>	
</div>`
	 return result
}