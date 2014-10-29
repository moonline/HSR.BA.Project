package docs;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface QueryParameters {

	Parameter[] value();

	public @interface Parameter {
		String name();

		boolean isId() default false;

		Class format() default String.class; //aka type, but "type" is a reserved word

		String description();
	}
}
