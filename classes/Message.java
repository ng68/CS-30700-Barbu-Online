package classes;

import java.util.Date;

public class Message {
	private User sender;
	private String content;
	private Date time;
	
	public Message(User sender, String content) {
		this.sender = sender;
		this.content = content;
		this.time = new Date();
	}
	
	public String to_string() {
		return sender.get_username() + ": " + content;
	}
	
	// Getters
	public User get_sender() {
		return sender;
	}
	
	public String get_content() {
		return content;
	}
	
	public Date get_time() {
		return time;
	}
	
	// Setters
	public void set_sender(User u) {
		sender = u;
	}
	
	public void set_content(String s) {
		content = s;
	}
	
	public void set_time(Date d) {
		time = d;
	}
}