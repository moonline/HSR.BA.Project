package controllers;

import play.mvc.With;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;

@With(AuthenticationChecker.Authenticator.class)
@Retention(RetentionPolicy.RUNTIME)
public @interface GuaranteeAuthenticatedUser {

}

