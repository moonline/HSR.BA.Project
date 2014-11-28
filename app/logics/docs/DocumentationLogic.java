package logics.docs;

import controllers.AbstractCRUDController;
import controllers.AbstractController;
import controllers.GuaranteeAuthenticatedUser;
import org.apache.commons.lang3.NotImplementedException;
import org.apache.commons.lang3.StringUtils;
import org.jetbrains.annotations.NotNull;
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

	public static final int MAGIC_CONSTANT_PARAMETER_IDENTIFICATION = 42;

	/**
	 * Gets all methods in all controllers (see getAllControllerClasses()) which is implicitly a list of all public API endpoints
	 */
	@NotNull
	public Map<Class<? extends Controller>, List<MethodDocumentation>> getAllAPICalls() {
		Map<Class<? extends Controller>, List<MethodDocumentation>> classesAndMethods = new TreeMap<>((Comparator<Class>) (o1, o2) -> o1.getCanonicalName().compareTo(o2.getCanonicalName()));
		//For each Controller
		for (Class<? extends Controller> aClass : getAllControllerClasses()) {
			Object routesObject = getRouteObject(aClass);
			List<MethodDocumentation> methodsInClass = new ArrayList<>();
			//For each Method of the Controller
			for (Method method : aClass.getDeclaredMethods()) {
				//If it's a callable method
				if (Modifier.isPublic(method.getModifiers()) && (method.getReturnType().isAssignableFrom(F.Promise.class) || method.getReturnType().isAssignableFrom(Result.class))) {
					//Remember it!
					methodsInClass.add(new MethodDocumentation(method, getCallObject(routesObject, method)));
				}
			}
			methodsInClass.sort((o1, o2) -> o1.call.url().compareTo(o2.call.url()));
			classesAndMethods.put(aClass, methodsInClass);
		}
		return classesAndMethods;
	}

	/**
	 * Gets the first part of the Play internal routing (the one, that corresponds to the given _class_).
	 * For example for the controllers.user.UserController (Class) the controller.user.routes.UserController (Field/Object) is returned.
	 */
	private Object getRouteObject(@NotNull Class<? extends Controller> controllerClass) {
		Class<?> routesClass = Reflections.forName(controllerClass.getPackage().getName() + ".routes");
		try {
			return routesClass.getField(controllerClass.getSimpleName()).get(routesClass.newInstance());
		} catch (@NotNull NoSuchFieldException | InstantiationException | IllegalAccessException e) {
			Logger.error("Could not create instance for " + routesClass, e);
			throw new RuntimeException("An Error occurred on 23523464", e);
		}

	}

	/**
	 * Gets the second part of the Play internal routing (the one, that corresponds to the given _method_).
	 * For example for controller.user.routes.UserController (Object) and controllers.user.UserController#login() the call controllers.user.routes.UserController.login() is returned.
	 */
	@NotNull
	private Call getCallObject(@NotNull Object routesObject, @NotNull Method method) {
		try {
			Class<?> routesClass = routesObject.getClass();
			return (Call) routesClass.getMethod(method.getName(), method.getParameterTypes()).invoke(routesObject, getExampleParams(method.getParameterTypes()));
		} catch (@NotNull NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
			Logger.error("Could not create call object for " + routesObject + "/" + method, e);
			throw new RuntimeException("An Error occurred on 823489", e);
		}

	}

	/**
	 * For a list of classes (parameter types) a list of instances of this class is returned.
	 * And for later identification of this instances, they have always the value of MAGIC_CONSTANT_PARAMETER_IDENTIFICATION.
	 */
	@NotNull
	private Object[] getExampleParams(@NotNull Class<?>[] parameterTypes) {
		ArrayList<Object> params = new ArrayList<>();
		for (Class<?> parameterType : parameterTypes) {
			if (parameterType.equals(Integer.class) || parameterType.equals(int.class)) {
				params.add(MAGIC_CONSTANT_PARAMETER_IDENTIFICATION);
			} else if (parameterType.equals(Long.class) || parameterType.equals(long.class)) {
				params.add((long) MAGIC_CONSTANT_PARAMETER_IDENTIFICATION);
			} else if (parameterType.equals(Character.class) || parameterType.equals(char.class)) {
				params.add((char) MAGIC_CONSTANT_PARAMETER_IDENTIFICATION);
			} else if (parameterType.equals(String.class)) {
				params.add(MAGIC_CONSTANT_PARAMETER_IDENTIFICATION + "");
			} else {
				throw new NotImplementedException("Parameter creation for " + parameterType + " is not yet implemented");
			}
		}
		return params.toArray();
	}

	/**
	 * Uses reflection to get all API-controller classes (extending AbstractController and in package controllers but not in package controllers.docs and not Abstract).
	 */
	@NotNull
	private Set<Class<? extends AbstractController>> getAllControllerClasses() {
		List<ClassLoader> classLoadersList = new LinkedList<>();
		classLoadersList.add(ClasspathHelper.contextClassLoader());
		classLoadersList.add(ClasspathHelper.staticClassLoader());

		Reflections reflections = new Reflections(new ConfigurationBuilder()
				.setScanners(new SubTypesScanner(), new ResourcesScanner())
				.setUrls(ClasspathHelper.forClassLoader(classLoadersList.toArray(new ClassLoader[classLoadersList.size()])))
				.filterInputsBy(new FilterBuilder().include(FilterBuilder.prefix("controllers")).exclude(FilterBuilder.prefix("controllers.docs"))));
		Set<Class<? extends AbstractController>> classes = reflections.getSubTypesOf(AbstractController.class);
		//Now removing all abstract Classes
		Iterator<Class<? extends AbstractController>> classIterator = classes.iterator();
		while (classIterator.hasNext()) {
			Class<? extends AbstractController> aClass = classIterator.next();
			if (Modifier.isAbstract(aClass.getModifiers())) {
				classIterator.remove();
			}
		}
		classes.remove(AbstractCRUDController.class);
		return classes;
	}

	/**
	 * Transforms Controller names (from e.g. TaskTemplateController to "Task Template")
	 */
	public String getHumanFriendlyClassName(@NotNull Class<? extends Controller> c) {
		String name = c.getSimpleName(); //class name
		name = name.replaceFirst("Controller$", "");//...without "Controller"
		name = name.replaceAll("((?<=[a-z])[A-Z])", " $1"); //...with CamelCase to Camel-Space-Case Transformation
		return name;
	}

	@NotNull
	public String getCurlRequestString(@NotNull MethodDocumentation method, @NotNull QueryExamples.Example example) {
		StringBuilder request = new StringBuilder("curl");
		if (!method.call.method().equals("GET")) {
			request.append(" --request ").append(method.call.method());
		}
		String queryString = calculateQueryString(method, example.parameters());
		if (queryString != null) {
			request.append(" --data \"").append(queryString).append("\"");
		}
		request.append(" ").append(getRequestUrl(method, true, example.id()));
		return request.toString();
	}

	public String getRequestUrl(@NotNull MethodDocumentation method, boolean asAbsolute, @NotNull String[] ids) {
		String url;
		if (asAbsolute) {
			url = method.call.absoluteURL(ctx().request());
		} else {
			url = method.call.url();
		}
		for (String id : ids) {
			url = url.replaceFirst(MAGIC_CONSTANT_PARAMETER_IDENTIFICATION + "", getRealQueryParameter(id));
		}
		return url;
	}

	@NotNull
	public String[] getIds(@Nullable QueryParameters.Parameter[] queryParameters) {
		List<String> ids = new ArrayList<>();
		if (queryParameters != null) {
			for (QueryParameters.Parameter queryParameter : queryParameters) {
				if (queryParameter.isId()) {
					ids.add(queryParameter.name());
				}
			}
		}
		return ids.toArray(new String[ids.size()]);
	}

	/**
	 * @param wrapper A String of which the array elements are created, "x" is replaced with the parameters name.
	 * @return A list of all IDs formatted with the wrapper.
	 */
	@NotNull
	public String[] getIdsWrapped(@Nullable QueryParameters.Parameter[] queryParameters, @NotNull String wrapper) {
		List<String> ids = new ArrayList<>();
		if (queryParameters != null) {
			for (QueryParameters.Parameter queryParameter : queryParameters) {
				if (queryParameter.isId()) {
					ids.add(wrapper.replaceAll("x", queryParameter.name()));
				}
			}
		}
		return ids.toArray(new String[ids.size()]);
	}

	/**
	 * Returns a response for a call example of the API.
	 * This is either the response data in the description of the method (if there is one) or the result of an executed call with the given example data.
	 */
	@NotNull
	public SimpleResponse getResponseString(@NotNull MethodDocumentation method, @NotNull QueryExamples.Example example, @NotNull ExampleDataCreator exampleDataCreator) {
		QueryExamples.Example.Response exampleResponse = example.response();
		if (exampleResponse.status() > 0) {
			return new SimpleResponse(exampleResponse.status(), null, exampleResponse.content(), false);
		} else {
			return simulateRequest(method, example, exampleDataCreator);
		}
	}

	@NotNull
	private SimpleResponse simulateRequest(@NotNull MethodDocumentation method, @NotNull QueryExamples.Example example, @NotNull ExampleDataCreator exampleDataCreator) {
		WSRequestHolder url = WS.url(getRequestUrl(method, true, example.id()));
		String queryString = calculateQueryString(method, example.parameters());
		if (queryString != null) {
			url.setQueryString(queryString);
		}
		if (example.provideAuthentication()) {
			url.setAuth(exampleDataCreator.USER_NAME, exampleDataCreator.USER_PASSWORD);
			url.setQueryParameter("basicAuth", "true");
		}
		F.Promise<WSResponse> promise = url.execute(method.call.method());
		WSResponse wsResponse = promise.get(30, SECONDS);
		return new SimpleResponse(wsResponse.getStatus(), wsResponse.getStatusText(), wsResponse.getBody(), true);
	}

	@Nullable
	private String calculateQueryString(@NotNull MethodDocumentation method, @NotNull String[] parameterValues) {
		int numberOfParameters;
		if (method.queryParameters == null) {
			numberOfParameters = 0;
		} else {
			numberOfParameters = calculateNumberOfRegularParameters(method, parameterValues);
		}
		if (numberOfParameters == 0) {
			return null;
		} else {
			List<String> data = new ArrayList<>();
			int queryParameterIndex = 0, exampleParameterIndex = 0;
			while (queryParameterIndex < method.queryParameters.length && exampleParameterIndex < parameterValues.length) {
				while (method.queryParameters[queryParameterIndex].isId()) {
					queryParameterIndex++;
				}
				data.add(method.queryParameters[queryParameterIndex].name() + "=" + getRealQueryParameter(parameterValues[exampleParameterIndex]));
				queryParameterIndex++;
				exampleParameterIndex++;
			}
			return StringUtils.join(data, "&");
		}
	}

	/**
	 * Some query parameters need to be backed up by real data and they are reference with REFERENCE_TYPE_ID.
	 * This method strips the ID out of this string.
	 */
	private String getRealQueryParameter(@NotNull String queryParameter) {
		return queryParameter.replaceFirst("REFERENCE_[^_]+_", "");
	}

	/**
	 * @return The number of parameters that are no ID.
	 */
	private int calculateNumberOfRegularParameters(@NotNull MethodDocumentation method, @NotNull String[] examples) {
		int numberOfParameters = 0;
		for (QueryParameters.Parameter parameter : method.queryParameters) {
			if (!parameter.isId()) {
				numberOfParameters++;
			}
		}
		if (numberOfParameters != examples.length) {
			Logger.error(method.call.url() + " (" + method.call.method() + ") has a non matching amount of example parameters (" + examples.length + ")");
		}
		return Math.min(numberOfParameters, examples.length);
	}

	/**
	 * Some query parameters need to be backed up by real data and they are reference with REFERENCE_TYPE_ID.
	 * This method creates the data that is referenced in the given methods.
	 */
	public void createCallExampleData(@NotNull Collection<List<MethodDocumentation>> allAPIMethods, @NotNull ExampleDataCreator exampleDataCreator) {
		for (List<MethodDocumentation> apiMethods : allAPIMethods) {
			for (MethodDocumentation apiMethod : apiMethods) {
				for (QueryExamples.Example queryExample : apiMethod.queryExamples) {
					for (String id : queryExample.id()) {
						if (id.startsWith("REFERENCE_")) {
							exampleDataCreator.createExampleObject(id, queryExample.isDataCacheable());
						}
					}
					for (String parameter : queryExample.parameters()) {
						if (parameter.startsWith("REFERENCE_")) {
							exampleDataCreator.createExampleObject(parameter, queryExample.isDataCacheable());
						}
					}
				}
			}
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

		public MethodDocumentation(@NotNull Method method, Call call) {
			this.call = call;
			this.queryParameters = getAnnotationContent(method, QueryParameters.class, QueryParameters::value);
			this.queryDescription = getAnnotationContent(method, QueryDescription.class, QueryDescription::value);
			this.queryResponses = getAnnotationContent(method, QueryResponses.class, QueryResponses::value);
			this.queryExamples = getAnnotationContent(method, QueryExamples.class, QueryExamples::value);
			this.requireAuthentication = method.getAnnotationsByType(GuaranteeAuthenticatedUser.class).length > 0;
		}

		@Nullable
		private <A extends Annotation, Return> Return getAnnotationContent(@NotNull Method method, Class<A> annotationClass, @NotNull Function<A, Return> get) {
			A[] annotation;
			boolean foundAnnotation;
			Class<?> clazz = method.getDeclaringClass();
			do {
				annotation = method.getAnnotationsByType(annotationClass);
				foundAnnotation = annotation.length > 0;
				if (!foundAnnotation) {
					clazz = clazz.getSuperclass();
					if (clazz == null) {
						return null;
					} else {
						try {
							method = clazz.getMethod(method.getName(), method.getParameterTypes());
						} catch (NoSuchMethodException ignored) {//there is no super method
						}
					}
				}
			} while (!foundAnnotation);
			return get.apply(annotation[0]);
		}

	}
}
