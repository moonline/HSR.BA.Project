package daos.dks;

import daos.AbstractDAO;
import models.dks.DKSMapping;

public class DKSMappingDAO extends AbstractDAO<DKSMapping> {
	public java.util.List<DKSMapping> readByDKSNode(String dksNode) {
		return findAll("select m from DKSMapping m where m.dksNode=?", dksNode);
	}
}
