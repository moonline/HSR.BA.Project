package tools;

import org.hibernate.cfg.Configuration;
import org.hibernate.cfg.Environment;
import org.hibernate.dialect.H2Dialect;
import org.hibernate.tool.hbm2ddl.SchemaExport;
import org.jetbrains.annotations.NotNull;
import org.reflections.Reflections;

import javax.persistence.Entity;
import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.Collection;
import java.util.Set;
import java.util.TreeSet;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class GenerateDDL {

	private static PrintStream originalSysout;
	private static ByteArrayOutputStream newSysout;

	/**
	 * run this class to generate the DDL for the specified domain classes
	 */
	public static void main(String[] args) {

		Configuration cfg = new Configuration();
		for (Class<?> entityClasses : new Reflections("models").getTypesAnnotatedWith(Entity.class)) {
			cfg.addAnnotatedClass(entityClasses);
		}
		cfg.setProperty(Environment.DIALECT, H2Dialect.class.getName());

		// configuration.setProperty(Environment.URL, "jdbc:h2:mem:play");
		// configuration.setProperty(Environment.DRIVER,
		// org.h2.Driver.class.getName());

		SchemaExport schema = new SchemaExport(cfg);
		// schema.setOutputFile("schema.sql");

		startCapturingSystemOut();
		schema.create(true, false);
		stopCapturingSystemOut();

		String dbCreationScheme = getCapturedSystemOut();
		dbCreationScheme = optimizeDBCreationScheme(dbCreationScheme);
		System.out.println(dbCreationScheme);
	}

	private static String optimizeDBCreationScheme(String dbCreationScheme) {
		dbCreationScheme = dbCreationScheme + "\n";
		dbCreationScheme = dbCreationScheme.toLowerCase();
		dbCreationScheme = dbCreationScheme.replaceAll("\n\n", ";\n\n");
		dbCreationScheme = dbCreationScheme.replaceAll("\n    ", "\n");
		dbCreationScheme = dbCreationScheme.replaceAll("alter table \\w+ \n\\s+drop constraint \\w+;\n\n", "");
		dbCreationScheme = dbCreationScheme.replaceAll("drop table (\\w+) if exists;", "drop table if exists $1;");
		dbCreationScheme = dbCreationScheme.replaceAll("longvarchar", "text");
		String createTables = joinString(getByRegex(dbCreationScheme, "create table [^;]*;"), "\n");
		String alterTables = joinString(getByRegex(dbCreationScheme, "alter table [^;]*;"), "\n");
		String createSequences = joinString(getByRegex(dbCreationScheme, "create sequence [^;]*;"), "\n");
		String dropTables = joinString(getByRegex(dbCreationScheme, "drop table [^;]*;"), "\n");
		String dropSequences = joinString(getByRegex(dbCreationScheme, "drop sequence [^;]*;"), "\n");
		return ("\n" + "# --- !Ups\n" + "\n" + createTables + "\n" + "\n" + alterTables + "\n" + "\n" + createSequences + "\n" + "\n" + "# --- !Downs\n" + "\n"
				+ "SET REFERENTIAL_INTEGRITY FALSE;\n" + "\n" + dropTables + "\n" + "\n" + "SET REFERENTIAL_INTEGRITY TRUE;\n" + "\n" + dropSequences).replaceAll("[\\t ]+\n", "\n");
	}

	private static String joinString(Collection<String> collection, String separator) {
		StringBuilder sb = new StringBuilder();
		boolean first = true;
		for (String item : collection) {
			if (first) {
				first = false;
			} else {
				sb.append(separator);
			}
			sb.append(item);
		}
		return sb.toString();
	}

	@NotNull
	private static Set<String> getByRegex(String haystack, String regex) {
		Matcher matcher = Pattern.compile(regex).matcher(haystack);
		Set<String> matches = new TreeSet<>();
		while (matcher.find()) {
			matches.add(matcher.group());
		}
		return matches;
	}

	private static void startCapturingSystemOut() {
		originalSysout = System.out;
		newSysout = new ByteArrayOutputStream();
		System.setOut(new PrintStream(newSysout));
	}

	@NotNull
	private static String getCapturedSystemOut() {
		return new String(newSysout.toByteArray());
	}

	private static void stopCapturingSystemOut() {
		System.setOut(originalSysout);
	}
}
