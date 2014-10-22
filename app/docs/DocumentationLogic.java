package docs;

import org.reflections.Reflections;
import org.reflections.scanners.ResourcesScanner;
import org.reflections.scanners.SubTypesScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;
import org.reflections.util.FilterBuilder;
import play.Logger;
import play.api.mvc.Call;
import play.libs.F;
import play.mvc.Controller;
import play.mvc.Result;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.*;

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
			return (Call) routesClass.getMethod(method.getName()).invoke(routesObject);
		} catch (NoSuchMethodException | IllegalAccessException | InvocationTargetException e) {
			Logger.error("Could not create call object for " + routesObject + "/" + method, e);
			throw new RuntimeException("An Error occurred on 823489");
		}

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

	/**
	 * This class is a Value-Object (http://en.wikipedia.org/wiki/Value_object) containing information about one API call
	 */
	public static class MethodDocumentation {

		public final Call call;
		public final QueryParameters.Parameter[] queryParameters;
		public final String queryDescription;
		public final QueryResponses.Response[] queryResponses;

		public MethodDocumentation(Method method, Call call) {
			this.call = call;
			QueryParameters[] queryParameters = method.getAnnotationsByType(QueryParameters.class);
			this.queryParameters = queryParameters.length > 0 ? queryParameters[0].value() : null;
			QueryDescription[] queryDescription = method.getAnnotationsByType(QueryDescription.class);
			this.queryDescription = queryDescription.length > 0 ? queryDescription[0].value() : null;
			QueryResponses[] queryResponses = method.getAnnotationsByType(QueryResponses.class);
			this.queryResponses = queryResponses.length > 0 ? queryResponses[0].value() : null;
		}

	}
}
