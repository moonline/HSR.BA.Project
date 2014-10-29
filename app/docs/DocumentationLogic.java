package docs;

import controllers.GuaranteeAuthenticatedUser;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.Nullable;
import org.reflections.Reflections;
import org.reflections.scanners.ResourcesScanner;
import org.reflections.scanners.SubTypesScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;
import org.reflections.util.FilterBuilder;
import play.Logger;
import play.api.mvc.Call;
import play.libs.F;
import play.libs.ws.WS;
import play.libs.ws.WSRequestHolder;
import play.libs.ws.WSResponse;
import play.mvc.Controller;
import play.mvc.Result;

import java.lang.annotation.Annotation;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;
import java.util.function.Function;

import static java.util.concurrent.TimeUnit.SECONDS;
import static play.mvc.Http.Context.Implicit.ctx;

public class DocumentationLogic {

	private static final Comparator<Class> classComparator = (o1, o2) -> o1.getCanonicalName().compareTo(o2.getCanonicalName());

	/**
	 * Gets all methods in all controllers (see getAllControllerClasses()) which is implicitly a list of all public API endpoints
	 */
	public Map<Class<? extends Controller>, List<MethodDocumentation>> getAllAPICalls() {
		Map<Class<? extends Controller>, List<MethodDocumentation>> classesAndMethods = new TreeMap<>(classComparator);
		for (Class<? extends Controller> aClass : getAllControllerClasses()) {
			Object routesObject = getRouteObject(aClass);
			List<MethodDocumentation> methodsInClass = new ArrayList<>();
			for (Method method : aClass.getDeclaredMethods()) {
				if (Modifier.isPublic(method.getModifiers()) && (method.getReturnType().isAssignableFrom(F.Promise.class) || method.getReturnType().isAssignableFrom(Result.class))) {
					methodsInClass.add(new MethodDocumentation(method, getCallObject(routesObject, method)));
				}
			}
			methodsInClass.sort((o1, o2) -> o1.call.url().compareTo(o2.call.url()));
			classesAndMethods.put(aClass, methodsInClass);
		}
		return classesAndMethods;
	}

	/**
	 * Gets the first part of the Play internal routing (the one, that corresponds to the given _class_)
	 */
	private Object getRouteObject(Class<? extends Controller> controllerClass) {
		Class<?> routesClass = Reflections.forName(controllerClass.getPackage().getName() + ".routes");
		try {
			return routesClass.getField(controllerClass.getSimpleName()).get(routesClass.newInstance());
		} catch (NoSuchFieldException | InstantiationException | IllegalAccessException e) {
			Logger.error("Could not create instance for " + routesClass, e);
			throw new RuntimeException("An Error occurred on 23523464");
		}

	}

	/**
	 * Gets the second part of the Play internal routing (the one, that corresponds to the given _method_)
	 */
	private Call getCallObject(Object routesObject, Method method) {
		try {
			Class<?> routesClass = routesObject.getClass();
			return (Call) routesClass.getMethod(method.getName(), method.getParameterTypes()).invoke(routesObject, getExampleParams(method.getParameterTypes()));
		} catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
			Logger.error("Could not create call object for " + routesObject + "/" + method, e);
			throw new RuntimeException("An Error occurred on 823489");
		}

	}

	private Object[] getExampleParams(Class<?>[] parameterTypes) {
		ArrayList<Object> params = new ArrayList<>();
		for (Class<?> parameterType : parameterTypes) {
			try {
				if (parameterType.equals(Integer.class) || parameterType.equals(int.class)) {
					params.add(0);

				} else if (parameterType.equals(Long.class) || parameterType.equals(long.class)) {
					params.add(0L);

				} else if (parameterType.equals(Character.class) || parameterType.equals(char.class)) {
					params.add('\0');

				} else {
					params.add(parameterType.getConstructor().newInstance());
				}
			} catch (InstantiationException | IllegalAccessException | InvocationTargetException | NoSuchMethodException e) {
				Logger.error("Could not create parameter for example object creation: " + parameterType, e);
			}
		}
		return params.toArray();
	}

	/**
	 * Uses reflection to get all controller classes (extending Controller and in package controllers)
	 */
	private Set<Class<? extends Controller>> getAllControllerClasses() {
		List<ClassLoader> classLoadersList = new LinkedList<>();
		classLoadersList.add(ClasspathHelper.contextClassLoader());
		classLoadersList.add(ClasspathHelper.staticClassLoader());

		Reflections reflections = new Reflections(new ConfigurationBuilder()
				.setScanners(new SubTypesScanner(false /* don't exclude Object.class */), new ResourcesScanner())
				.setUrls(ClasspathHelper.forClassLoader(classLoadersList.toArray(new ClassLoader[classLoadersList.size()])))
				.filterInputsBy(new FilterBuilder().include(FilterBuilder.prefix("controllers"))));
		return reflections.getSubTypesOf(Controller.class);
	}

	public String getHumanFriendlyClassName(Class<? extends Controller> c) {
		String name = c.getSimpleName(); //class name
		name = name.replaceFirst("Controller$", "");//...without "Controller"
		name = name.replaceAll("((?<=[a-z])[A-Z])", " $1"); //...with CamelCase to Camel-Space-Case Transformation
		return name;
	}

	public String getCurlRequestString(MethodDocumentation method, QueryExamples.Example example) {
		StringBuilder request = new StringBuilder("curl");
		if (!method.call.method().equals("GET")) {
			request.append(" --request ").append(method.call.method());
		}
		String queryString = calculateQueryString(method, example.parameters());
		if (queryString != null) {
			request.append(" --data \"").append(queryString).append("\"");
		}
		request.append(" ").append(getRequestUrl(method, true));
		return request.toString();
	}

	public String getRequestUrl(MethodDocumentation method, boolean asAbsolute) {
		String url;
		if (asAbsolute) {
			url = method.call.absoluteURL(ctx().request());
		} else {
			url = method.call.url();
		}
		return url.replaceAll("\\?.*", "");
	}

	public SimpleResponse getResponseString(MethodDocumentation method, QueryExamples.Example example) {
		QueryExamples.Example.Response exampleResponse = example.response();
		if (exampleResponse.status() > 0) {
			return new SimpleResponse(exampleResponse.status(), null, exampleResponse.content(), false);
		} else {
			return simulateRequest(method, example.parameters());
		}
	}

	private SimpleResponse simulateRequest(MethodDocumentation method, String[] parameterValues) {
		WSRequestHolder url = WS.url(getRequestUrl(method, true));
		String queryString = calculateQueryString(method, parameterValues);
		if (queryString != null) {
			url.setQueryString(queryString);
		}
		F.Promise<WSResponse> promise = url.execute(method.call.method());
		WSResponse wsResponse = promise.get(30, SECONDS);
		return new SimpleResponse(wsResponse.getStatus(), wsResponse.getStatusText(), wsResponse.getBody(), true);
	}

	@Nullable
	private String calculateQueryString(MethodDocumentation method, String[] parameterValues) {
		int numberOfParameters;
		if (method.queryParameters == null) {
			numberOfParameters = 0;
		} else {
			numberOfParameters = Math.min(method.queryParameters.length, parameterValues.length);
		}
		if (numberOfParameters == 0) {
			return null;
		} else {
			List<String> data = new ArrayList<>();
			for (int i = 0; i < numberOfParameters; i++) {
				String parameterName = method.queryParameters[i].name();
				data.add(parameterName + "=" + parameterValues[i]);
			}
			return StringUtils.join(data, "&");
		}
	}

	public static class SimpleResponse {

		private final int status;
		private final String statusText;
		private final String body;
		private final boolean isRealSimulation;

		public SimpleResponse(int status, String statusText, String body, boolean isRealSimulation) {
			this.status = status;
			this.statusText = statusText;
			this.body = body;
			this.isRealSimulation = isRealSimulation;
		}

		public int getStatus() {
			return status;
		}

		public String getStatusText() {
			return statusText;
		}

		public String getBody() {
			return body;
		}

		public boolean isRealSimulation() {
			return isRealSimulation;
		}
	}

	/**
	 * This class is a Value-Object (http://en.wikipedia.org/wiki/Value_object) containing information about one API call
	 */
	public static class MethodDocumentation {

		public final Call call;
		public final QueryParameters.Parameter[] queryParameters;
		public final String queryDescription;
		public final QueryResponses.Response[] queryResponses;
		public final QueryExamples.Example[] queryExamples;
		public final boolean requireAuthentication;

		public MethodDocumentation(Method method, Call call) {
			this.call = call;
			this.queryParameters = getAnnotationContent(method, QueryParameters.class, QueryParameters::value);
			this.queryDescription = getAnnotationContent(method, QueryDescription.class, QueryDescription::value);
			this.queryResponses = getAnnotationContent(method, QueryResponses.class, QueryResponses::value);
			this.queryExamples = getAnnotationContent(method, QueryExamples.class, QueryExamples::value);
			this.requireAuthentication = method.getAnnotationsByType(GuaranteeAuthenticatedUser.class).length > 0;
		}

		private <A extends Annotation, Return> Return getAnnotationContent(Method method, Class<A> annotationClass, Function<A, Return> get) {
			A[] annotation = method.getAnnotationsByType(annotationClass);
			if (annotation.length > 0) {
				return get.apply(annotation[0]);
			} else {
				return null;
			}
		}

	}
}
