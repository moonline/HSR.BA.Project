package models.user;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import models.AbstractEntity;
import org.jetbrains.annotations.NotNull;

import javax.persistence.Entity;
import javax.persistence.Table;
import java.security.SecureRandom;

@Entity
@Table(name = "person")
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "id")
public class User extends AbstractEntity {

	private String name;

	@JsonIgnore
	private byte[] salt;

	@JsonIgnore
	private byte[] passwordHash;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public byte[] getPasswordHash() {
		return passwordHash;
	}

	public void setPasswordHash(byte[] passwordHash) {
		this.passwordHash = passwordHash;
	}

	public byte[] getSalt() {
		return salt;
	}

	public void initSalt(@NotNull SecureRandom secureRandom) {
		salt = secureRandom.generateSeed(20);
	}

	@Override
	public String toString() {
		return "<User " + getId() + " " + name + ">";
	}
}
