package controllers;

import play.mvc.Controller;
import play.mvc.Result;
import play.twirl.api.JavaScript;
import views.js.configuration.paths;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;

public class GeneralController extends Controller {

	public Result paths() {
		return ok(new JavaScript(urlDecode(paths.render().body().replaceAll("\\\\/", "/"))));
	}

	private String urlDecode(String s) {
		try {
			return URLDecoder.decode(s, "UTF-8");
		} catch (UnsupportedEncodingException e) {
			throw new RuntimeException(e); //this can not happen, as the encoding is hardcoded
		}
	}

}
