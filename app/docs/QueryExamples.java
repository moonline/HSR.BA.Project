package docs;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface QueryExamples {

	Example[] value();

	public @interface Example {
		String[] parameters();

		Response response() default @Response(status = 0, content = "");

		public @interface Response {
			int status();

			String content();
		}

	}
}
