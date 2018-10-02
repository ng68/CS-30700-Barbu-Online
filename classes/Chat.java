package classes;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;

public class Chat {
	private ArrayList<User> participants;
	private ArrayList<Message> messages;
	
	public Chat(User[] participants) {
		this.participants = new ArrayList<User>(Arrays.asList(participants));
		messages = new ArrayList<Message>();
	}
	
	public void add_message(Message m) {
		if(m.get_content() != "" && participants.contains(m.get_sender())) {
			messages.add(m);
		}
	}
	
	public void add_participant(User u) {
		participants.add(u);
	}
	
	public void remove_participant(User u) {
		participants.remove(u);
	}
	
	// Getters
	public User[] get_participants() {
		User[] participants_array = new User[participants.size()];
		participants_array = participants.toArray(participants_array);

		return participants_array;
	}
	
	public Message[] get_messages() {
		Message[] messages_array = new Message[messages.size()];
		messages_array = messages.toArray(messages_array);

		return messages_array;
	}
	
	// Setters
	public void set_participants(User[] u) {
		participants = (ArrayList<User>) Arrays.asList(u);
	}
	
	public void set_messages(Message[] m) {
		messages = (ArrayList<Message>) Arrays.asList(m);
	}
}