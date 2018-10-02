package classes;

import java.util.ArrayList;
import java.util.Arrays;

public class User {
	private String username;
	private int wins;
	private int losses;
	private double win_pct;
	private double avg_score;
	private ArrayList<User> friends;
	
	public User(String username) {
		this.username = username;
		this.wins = 0;
		this.losses = 0;
		this.win_pct = 0.0;
		this.avg_score = 0.0;
		this.friends = new ArrayList<User>();
	}
	
	public void add_game(int place, double score) {
		avg_score = (avg_score * (wins + losses) + score) / (wins + losses + 1);
		if(place == 1) {
			wins++;
		}
		else {
			losses++;
		}
		win_pct = wins * 1.0 / (wins + losses);
	}
	
	public void add_friend(User u) {
		friends.add(u);
		return;
	}
	
	public void remove_friend(User u) {
		friends.remove(u);
		return;
	}

	// Getters
	public String get_username() {
		return username;
	}
	
	public int get_wins() {
		return wins;
	}
	
	public int get_losses() {
		return losses;
	}
	
	public double get_win_pct() {
		return win_pct;
	}
	
	public double get_avg_score() {
		return avg_score;
	}
	
	public User[] get_friends() {
		return (User[]) friends.toArray();
	}
	
	// Setters
	public void set_username(String s) {
		username = s;
	}
	
	public void set_wins(int n) {
		wins = n;
	}
	
	public void set_losses(int n) {
		losses = n;
	}
	
	public void set_win_pct(double n) {
		win_pct = n;
	}
	
	public void set_avg_score(double n) {
		avg_score = n;
	}
	
	public void set_friends(User[] u) {
		friends = (ArrayList<User>) Arrays.asList(u);
	}
}