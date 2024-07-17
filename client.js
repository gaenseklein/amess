 const amess = {
	init: function(){
		this.get_updates()
		this.show_group_overview()
	},
	data_storage: {
		profile:{
			last_update: new Date("2024-06-21"), //for testing purpose
		}
	},
/**
 * gets updates from server - for now just put some test-data
 **/ 
	get_updates: function(){
		let testdata = {
			groups:[
				{
					id: "group1",
					icon: "img/groupavatar/group1.png", //icon of the group
					name: "my group",
					last_message: {
						name: "username",
						message: "the actual message"
					//read_status: 0, //0-2 - 0: not recieved by server, 1: recieved by server, 2: read by user
					},
					last_update: new Date('2024-06-26'), //last update to group
					unread_count: 1,
					messages: [
						{
							icon: "img/avatar/user.png", //icon of the user
							id: "message123",
							read_status: 2,
							name: "username",
							uid: "userid",
							message: "message-string",
							date: new Date('2024-06-20'),
							group_id: "group1",
							type: "standard",
						},
						{
							icon: "img/avatar/user.png", //icon of the user
							id: "message124",
							read_status: 0,
							name: "username2",
							uid: "userid",
							message: "2. message string",
							date: new Date('2024-06-22'),
							group_id: "group1",
							type: "standard",
						}
					],
					members: [
						{uid: "uid", name: "username", blocked: false},
						{uid: "uid1", name: "username1", blocked: false},
						{uid: "uid2", name: "username2", blocked: false},
						{uid: "uid3", name: "username3", blocked: false},
						{uid: "uid4", name: "username4", blocked: false},
					],
					activitys: [
						{
							type: "task",
							id: "task123",
							open: true,
							name: "titel",
							duration: 90, //minutes
							last_update: new Date('2024-06-20'), //last update to activity
							start_date: new Date("2024-09-08T12:30:00"),		
							description: "a long description of the task",							
							max_participants: 5,
							group_id: "group1",
							participants: [
								{
									uid: "some_uid",
									name: "some_name",									
								}
							],
							messages: [], 
						}
					],
					// linked_groups: ["groupid","group1"], only internally or just for first invitation
					// invitations: ["uid","uid"] only internally or just for first invitation
				},//end of group
			], //end of groups[]
			contacts:[
				{uid: "uid", name: "username", blocked: false},
			],
			profile: {
				id: "uid",
				name: "username",
				last_update: new Date(),
				icon: "img/avatar/user.png",
				children: [
					{id: "childid", name: "childname", classroom: "group"},
				],
			},
		}
		this.mark_messages_as_unread(testdata.groups[0].messages)
		this.data_storage = testdata		
	},
	mark_messages_as_unread: function(messages){
		let last_update = this.data_storage.profile.last_update
		for(let i=0;i<messages.length;i++){
			if(messages[i].date > last_update && messages[i].unread === undefined){
				messages[i].unread = true
			}
		}
	},
/**
 * @param {group} group - the group
 */	
	count_unread_messages_for_group: function(group){
		let c = 0
		for(let i=0;i<group.messages.length;i++){
			if(group.messages[i].unread)c++
		}	
		group.unread_count = c
	},
	get_messages_for_group: function(group_id){
		let group = this.get_group_by_id(group_id)
		if(group && group.messages)	return group.messages
		return []
	},
	get_group_by_id: function(id){
		let groups = this.get_groups()
		for(let i=0;i<groups.length;i++){
			if(groups[i].id==id)return groups[i]
		}	
		return false
	},
	get_groups: function(){
		return this.data_storage.groups
	},
	get_all_activitys: function(){
		let open_activitys = []
		let closed_activitys = []
		let participated_activitys = []
		let groups = this.get_groups()
		
		for(let i=0;i<groups.length;i++){
			for(let ii=0;ii<groups[i].activitys.length;ii++){
				let activity = groups[i].activitys[ii]
				let found = false
				for(let a=0;a<activity.participants.length;a++){
					if (activity.participants[a].uid == this.data_storage.profile.id){
						participated_activitys.push(activity)
						found = true
						break;
					}					
				}
				if(found)continue;
				if(activity.participants.length<activity.max_participants){
					open_activitys.push(activity)
				}else{
					closed_activitys.push(activity)
				}
			}
		}
		open_activitys.sort(function(a,b){return a.last_update - b.last_update})
		closed_activitys.sort(function(a,b){return a.last_update - b.last_update})
		participated_activitys.sort(function(a,b){return a.last_update - b.last_update})
		return {
			open: open_activitys,
			closed: closed_activitys,
			own: participated_activitys
		}
	},
	get_activity_by_id: function(id, group_id){
		if(group_id){
			let group = this.get_group_by_id(group_id)
			for(let i=0;i<group.activitys.length;i++){
				if(group.activitys[i].id==id)return group.activitys[i]
			}
		}else{
			let groups = this.get_groups()
			for(let i=0;i<groups.length;i++){
				for(let ii=0;ii<groups[i].activitys.length;ii++){
					if(groups[i].activitys[ii].id==id)return groups[i].activitys[ii]
				}
			}
		}		
	},	
	build_group_overview: function(){
		let groups = this.get_groups()
		let group_elements = []
		for(let i=0;i<groups.length;i++){
			this.count_unread_messages_for_group(groups[i])
			group_elements.push(template_groupoverview_element(groups[i]))
		}		
		return group_elements.join('')
	},
	build_group_chat: function(group_id){
		let i = 0
		let group =  this.get_group_by_id(group_id)		
		console.log("build group chat", group_id, group);
		let messages = this.get_messages_for_group(group_id)
		console.log('messages:', messages);
		let header_html = template_chat_header(group)
		let activity_buttons = []
		for(i=0;i<group.activitys.length;i++){
			activity_buttons.push(template_chat_activity_button(group.activitys[i]))
		}
		messages.sort(function(a,b){
			return a.date - b.date
		})
		let outputs = []				
		for(i=0;i<messages.length;i++){
			outputs.push(template_chat_element(messages[i],{}))
		}		
		let html = header_html
		html += `<div class="activity_buttons">${activity_buttons.join('')}</div>`
		html += `<div class="message_board" onscrollend="amess.on_scroll_to_messages(this, '${group_id}')">${outputs.join('')}</div>`
		html += template_posting_prompt({
			callback_function: 'amess.send_message',
			callback_params: group_id,
			prompt_id: "chat_"+group_id,
		})
		// group_chat.innerHTML = html //do we do it here or elsewhere?
		return html
	},
	build_activity: function(activity){
		if(activity.type=="task"){
			return template_task(activity, this.data_storage.profile.id)
		}	
	},
	build_activity_overview: function(){
		let activitys = this.get_all_activitys()
		let result = {
			open:"",
			closed:"",
			own: "",
		}
		let i=0
		for(i=0;i<activitys.open.length;i++){
			result.open += template_task_overview_element(activitys.open[i])
		}
		for(i=0;i<activitys.closed.length;i++){
			result.closed += template_task_overview_element(activitys.closed[i])
		}
		for(i=0;i<activitys.own.length;i++){
			result.own += template_task_overview_element(activitys.own[i])
		}
		let html = template_task_overview_header()
		html += template_task_overview(result)
		return html
	},
	show_group_overview: function(dont_change){
		let html = this.build_group_overview()
		groupsoverview.innerHTML = html	
		if(dont_change)return
		this.change_status('groupsoverview')
	},
	show_activity_overview: function(){
		let html = this.build_activity_overview()
		activity_overview.innerHTML = html
		activity_overview.className = "own"
		this.change_status('activity_overview')
	},
	show_activity_overview_tab(tab){
		activity_overview.className = tab		
	},
	show_group: function(group_id){
		let html = this.build_group_chat(group_id)
		group_chat.innerHTML = html		
		this.change_status('group_chat')		
		this.scroll_to_new_messages(this.get_group_by_id(group_id).messages)
		this.on_scroll_to_messages(group_chat.querySelector('.message_board'), group_id)
	},
	show_group_details: function(group_id){
			
	},
	show_group_options: function(group_id){
		
	},
	show_search: function(group_id){
		
	},
	show_activitys: function(group_id){
		let group = this.get_group_by_id(group_id)
		let activitys = group.activitys
			
	},
	show_activity: function(id, group_id){
		let activity = this.get_activity_by_id(id, group_id)
		if(!activity){
			console.error('no activity found')
			return
		}	
		let html = this.build_activity(activity)
		console.log(html);
		activity_display.innerHTML = html
		this.change_status('activity_display')
	},
/**
 * @param {message[]} messages - an array containing the messages
 * @returns {Object}  - returns a hashmap with id as keys
 */	
	get_messages_as_map: function(messages){
		let result = {}
		for(let i=0;i<messages.length;i++){
			result[messages[i].id]=messages[i]
		}
		return result
	},
	on_scroll_to_messages: function(wrapper, group_id){
		let group = this.get_group_by_id(group_id)
		let mesmap = this.get_messages_as_map(group.messages)
		if(group.unread_count==0){
			console.log('nothing to do after scroll')
			//return
		}
		let viewmax = wrapper.offsetTop + wrapper.clientHeight + wrapper.scrollTop		
		let found = false
		for(let i=0;i<wrapper.children.length;i++){
			let child = wrapper.children[i]
			if(child.offsetTop < viewmax){
				console.log('child was viewed')
				let id = child.id.substring(3)
				if(mesmap[id] && mesmap[id].unread){
					console.log('child was unread before')
					mesmap[id].unread=false
					found = true
				}
			}
		}
		if(found){
			this.count_unread_messages_for_group(group)
			this.show_group_overview(true)
		}		
	},
	scroll_to_new_messages(messages){
		let message = messages[messages.length-1]
		for(let i=messages.length-2;i>0;i--){
			if(!messages[i].unread){
				message = messages[i]
				break
			}
		}
		let domel = document.getElementById('mw_'+message.id)
		domel.scrollIntoView()		
	},
	status_history: [],
	change_status: function(status){
		document.body.className = status
		//or: 
		let obj = document.getElementById(status)
		if(obj.tagName == "dialog"){
			if(obj.open)obj.close()
			obj.showModal()
		}
		if(this.status_history[this.status_history.length-1]!=status){
			this.status_history.push(status)			
		}
	},
	accept_task: function(task_id, user_has_task){
		// let activity = this.get_activity_by_id(task_id)
		if(!user_has_task){
			this.emulate_accept_task(task_id)	
		}else{
			this.emulate_remove_task(task_id)	
		}
	},
	emulate_accept_task: function(task_id){
		let activity = this.get_activity_by_id(task_id)
		activity.participants.push({
			name: this.data_storage.profile.name,
			uid: this.data_storage.profile.id,
		})
		this.show_activity(task_id, activity.group_id)		
	},
	emulate_remove_task: function(task_id){
		let activity = this.get_activity_by_id(task_id)
		for(let i=0;i<activity.participants.length;i++){
			if(activity.participants[i].uid == this.data_storage.profile.id){
				activity.participants.splice(i, 1)
				break;
			}
		}
		this.show_activity(task_id, activity.group_id)
	},
	send_message: function(message, id, is_activity){
		if(is_activity){
			this.send_message_to_activity(message, id)
			return
		}
		console.log('message send', message, 'to group', id);
		this.emulate_send_message(message, id)
		
	},
	emulate_send_message: function(message, id){
		let gr = this.get_group_by_id(id)
		let test_message = {
					icon: this.data_storage.profile.icon,
					id: "testmessage"+gr.messages.length,
					read_status: 1,
					name: this.data_storage.profile.name,
					uid: this.data_storage.profile.id,
					message: message,
					date: new Date(),
					group_id: id,
					type: "standard",
					
				}
		gr.messages.push(test_message)	
		console.log('testmessage',test_message)
		this.show_group(id)
	},	
	back: function(){
		let act_status = this.status_history.pop()
		let status = this.status_history.pop()
		if(status){
			this.change_status(status)
		}else{
			this.status_history.push(act_status)
		}
	},
		
}
amess.init()

/**
 * @typedef group
 * @type {Object}
 * @property {string} id - 
 * @property {string} icon - 
 * @property {string} name - 
 * @property {date} last_update - 
 * @property {number} unread_count - 
 * @property {message[]} messages - 
 * @property {activity[]} activitys - 
 * @property {members[]} members - 
 **/

